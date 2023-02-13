import { Component, Inject, OnInit } from '@angular/core';
import { DeleteUserByIdGQL, IDeleteUserByIdGQLResponse } from '../../../graphql';
import { EMPTY, Observable, Subject, catchError, filter, map, take, tap } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { DynamicFormError } from '@detective.solutions/frontend/shared/dynamic-form';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { QueryRef } from 'apollo-angular';
import { UserDTO } from '@detective.solutions/frontend/shared/data-access';

@Component({
  selector: 'users-delete-dialog',
  styleUrls: ['users-delete-dialog.component.scss'],
  templateUrl: 'users-delete-dialog.component.html',
})
export class UsersDeleteDialogComponent implements OnInit {
  readonly isLoading$ = new Subject<boolean>();

  user!: UserDTO;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { user: UserDTO; searchQuery: QueryRef<Response> },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly deleteUserByIdGQL: DeleteUserByIdGQL,
    private readonly toastService: ToastService,
    private readonly dialogRef: MatDialogRef<UsersDeleteDialogComponent>,
    private readonly logger: LogService
  ) {}

  ngOnInit() {
    this.user = this.dialogInputData.user;
  }

  deleteUser() {
    this.deleteUserByIdGQL
      .mutate({
        filter: {
          xid: {
            eq: this.dialogInputData.user.id,
          },
        },
      })
      .pipe(
        tap(() => this.isLoading$.next(true)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter((response: any) => response?.data),
        take(1),
        map(({ data }: { data: IDeleteUserByIdGQLResponse }) => data),
        catchError((error: Error) => this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error))
      )
      .subscribe((response: IDeleteUserByIdGQLResponse) => this.handleResponse(response));
  }

  private handleResponse(response: IDeleteUserByIdGQLResponse) {
    this.isLoading$.next(false);

    if (response.deleteUser.msg === 'Deleted') {
      this.translationService
        .selectTranslate('users.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogInputData.searchQuery.refetch(); // Update parent view
          this.dialogRef.close();
        });
    } else {
      this.logger.error('User could not be deleted');
      this.translationService
        .selectTranslate('users.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(errorType: DynamicFormError, error: Error): Observable<never> {
    this.isLoading$.next(false);

    let translationKey;
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'users.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      translationKey = 'users.toastMessages.formSubmitError';
      this.logger.error('Encountered an error while submitting form data');
    }
    console.error(error);

    if (translationKey) {
      this.translationService
        .selectTranslate(translationKey, {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
    return EMPTY;
  }
}
