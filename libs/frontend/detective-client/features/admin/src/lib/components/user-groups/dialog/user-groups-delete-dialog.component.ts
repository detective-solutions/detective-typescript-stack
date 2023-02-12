import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import { Component, Inject } from '@angular/core';
import {
  DeleteMaskingGQL,
  DeleteUserGroupByIdGQL,
  GetMaskingByUserGroupIdGQL,
  IDeleteMaskingGQLResponse,
  IDeleteUserGroupByIdGQLResponse,
  IGetMaskingByUserGroupIdGQLResponse,
} from '../../../graphql';
import { EMPTY, Observable, Subject, catchError, filter, map, switchMap, take, tap } from 'rxjs';
import { IMask, IMasking } from '@detective.solutions/shared/data-access';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { DynamicFormError } from '@detective.solutions/frontend/shared/dynamic-form';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { QueryRef } from 'apollo-angular';
import { UserGroupDTO } from '@detective.solutions/frontend/shared/data-access';

@Component({
  selector: 'user-groups-delete-dialog',
  styleUrls: ['user-groups-delete-dialog.component.scss'],
  templateUrl: 'user-groups-delete-dialog.component.html',
})
export class UserGroupsDeleteComponent {
  readonly isLoading$ = new Subject<boolean>();
  readonly relatedMaskings$ = this.getMaskings().pipe(
    tap((maskingsToDelete: IMasking[]) => {
      this.maskingsToDelete = maskingsToDelete;
    })
  );

  private maskingsToDelete!: IMasking[];
  private getMaskingsOfUserGroupByIdWatchQuery!: QueryRef<Response>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { userGroup: UserGroupDTO; searchQuery: QueryRef<Response> },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly authService: AuthService,
    private readonly deleteUserGroupByIdGQL: DeleteUserGroupByIdGQL,
    private readonly deleteMaskingGQL: DeleteMaskingGQL,
    private readonly dialogRef: MatDialogRef<UserGroupsDeleteComponent>,
    private readonly getMaskingsOfUserGroupByIdGQL: GetMaskingByUserGroupIdGQL,
    private readonly logger: LogService,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService
  ) {}

  deleteUserGroup() {
    this.isLoading$.next(true);
    this.deleteUserGroupByIdGQL
      .mutate({
        filter: {
          xid: {
            eq: this.dialogInputData.userGroup.id,
          },
        },
      })
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter((response: any) => response?.data),
        map(({ data }: { data: IDeleteUserGroupByIdGQLResponse }) => data),
        take(1),
        catchError((error: Error) => this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error))
      )
      .subscribe((response: IDeleteUserGroupByIdGQLResponse) => {
        if (!Object.keys(response).includes('error')) {
          this.maskingsToDelete.forEach((maskingToDelete: IMasking) => {
            this.deleteMaskingGQL
              .mutate({
                filter: {
                  xid: {
                    eq: maskingToDelete.id,
                  },
                },
                remove: {
                  columns: maskingToDelete.columns?.map((mask: IMask) => mask.id) ?? [],
                  rows: maskingToDelete.rows?.map((mask: IMask) => mask.id) ?? [],
                },
              })
              .pipe(
                tap(({ loading }) => this.isLoading$.next(loading)),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                filter((response: any) => response?.data),
                map(({ data }: { data: IDeleteMaskingGQLResponse }) => data.deleteMasking),
                take(1)
              )
              .subscribe((response: { msg: string }) => console.log('Masking deleted: ', response));
          });
        }
        this.handleResponse(response);
      });
  }
  private getMaskings(): Observable<IMasking[]> {
    return this.authService.authStatus$.pipe(
      switchMap((authStatus: IAuthStatus) => {
        const searchParameters = {
          userGroupId: this.dialogInputData.userGroup.id,
          tenantId: authStatus.tenantId,
        };
        if (!this.getMaskingsOfUserGroupByIdWatchQuery) {
          this.getMaskingsOfUserGroupByIdWatchQuery = this.getMaskingsOfUserGroupByIdGQL.watch(searchParameters, {
            notifyOnNetworkStatusChange: true,
          });
          return this.getMaskingsOfUserGroupByIdWatchQuery.valueChanges;
        } else {
          return this.getMaskingsOfUserGroupByIdWatchQuery.refetch(searchParameters);
        }
      }),
      tap(({ loading }) => this.isLoading$.next(loading)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter((response: any) => response?.data),
      map(({ data }: { data: IGetMaskingByUserGroupIdGQLResponse }) => data.queryMasking)
    );
  }

  private handleResponse(response: IDeleteUserGroupByIdGQLResponse) {
    this.isLoading$.next(false);
    if (response.deleteUserGroup.msg === 'Deleted') {
      this.translationService
        .selectTranslate('userGroups.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogRef.close();
        });
      this.dialogInputData.searchQuery.refetch();
    } else {
      this.logger.error('User group could not be deleted');
      this.translationService
        .selectTranslate('userGroups.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(errorType: DynamicFormError, error: Error): Observable<never> {
    let translationKey;
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'userGroups.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      this.isLoading$.next(false);
      translationKey = 'userGroups.toastMessages.formSubmitError';
      this.logger.error('Encountered an error while submitting the form data');
    }
    console.error(error);

    if (translationKey) {
      this.translationService
        .selectTranslate(translationKey, {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, 'Close', ToastType.ERROR);
        });
    }
    return EMPTY;
  }
}
