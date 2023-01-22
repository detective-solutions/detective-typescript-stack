import { Component, Inject, OnInit } from '@angular/core';
import { EMPTY, Observable, Subject, catchError, filter, map, take, tap } from 'rxjs';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { IUpdateUserRoleGQLResponse, UpdateUserRoleGQL } from '../../../graphql';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { DynamicFormError } from '@detective.solutions/frontend/shared/dynamic-form';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { QueryRef } from 'apollo-angular';
import { UserDTO } from '@detective.solutions/frontend/shared/data-access';
import { UserRole } from '@detective.solutions/shared/data-access';

@Component({
  selector: 'users-edit-dialog',
  styleUrls: ['users-edit-dialog.component.scss'],
  templateUrl: 'users-edit-dialog.component.html',
})
export class UserEditDialogComponent implements OnInit {
  readonly availableRoles = Object.values(UserRole).filter((role: UserRole) => role !== UserRole.NONE);
  readonly isLoading$ = new Subject<boolean>();

  userToEdit!: UserDTO;
  userEditForm!: FormGroup;

  private readonly roleFormControlName = 'role';

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { user: UserDTO; searchQuery: QueryRef<Response> },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly dialogRef: MatDialogRef<UserEditDialogComponent>,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly logger: LogService,
    private readonly toastService: ToastService,
    private readonly translationService: TranslocoService,
    private readonly updateUserRoleGQL: UpdateUserRoleGQL
  ) {}

  ngOnInit() {
    this.userToEdit = this.dialogInputData.user;
    this.userEditForm = this.formBuilder.group({
      [this.roleFormControlName]: [this.userToEdit[this.roleFormControlName]],
    });
  }

  updateUser() {
    this.updateUserRoleGQL
      .mutate({
        patch: {
          filter: {
            xid: {
              eq: this.userToEdit.id,
            },
          },
          set: {
            [this.roleFormControlName]: this.userEditForm.get(this.roleFormControlName)?.value,
            lastUpdated: new Date().toISOString(),
          },
        },
      })
      .pipe(
        tap(() => this.isLoading$.next(true)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter((response: any) => response?.data),
        take(1),
        map(({ data }: { data: IUpdateUserRoleGQLResponse }) => data),
        catchError((error: Error) => this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error))
      )
      .subscribe((response: IUpdateUserRoleGQLResponse) => this.handleResponse(response));
  }

  private handleResponse(response: IUpdateUserRoleGQLResponse) {
    this.isLoading$.next(false);

    if (Object.keys(response).includes('error')) {
      this.logger.error('User could not be edited');
      this.translationService
        .selectTranslate('users.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    } else {
      this.translationService
        .selectTranslate('users.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogInputData.searchQuery.refetch(); // Update parent view
          this.dialogRef.close();
        });
    }
  }

  private handleError(errorType: DynamicFormError, error: Error): Observable<never> {
    this.isLoading$.next(false);

    let translationKey;
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'users.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      translationKey = 'users.toastMessages.formSubmitError';
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
