import { Component, Inject } from '@angular/core';
import { EMPTY, catchError, map, take } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { DynamicFormError } from '@detective.solutions/frontend/shared/dynamic-form';
import { IDeleteUserGQLResponse } from '../../../graphql';
import { IUser } from '@detective.solutions/shared/data-access';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { UsersService } from '../../../services';

@Component({
  selector: 'users-delete-dialog',
  styleUrls: ['users-delete-dialog.component.scss'],
  templateUrl: 'users-delete-dialog.component.html',
})
export class UsersDeleteDialogComponent {
  readonly userToBeDeleted$ = this.userService.getUserById(this.dialogInputData.id);
  readonly userName$ = this.userToBeDeleted$.pipe(map((value: IUser) => `${value.firstname} ${value.lastname}`));

  isSubmitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { id: string },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly dialogRef: MatDialogRef<UsersDeleteDialogComponent>,
    private readonly userService: UsersService,
    private readonly logger: LogService
  ) {}

  deleteUser() {
    this.isSubmitting = true;
    this.userService
      .deleteUser(this.dialogInputData.id)
      .pipe(
        take(1),
        catchError((error: Error) => {
          this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error);
          return EMPTY;
        })
      )
      .subscribe((response: IDeleteUserGQLResponse) => {
        this.handleResponse(response);
      });
  }

  private handleResponse(response: IDeleteUserGQLResponse) {
    this.isSubmitting = false;
    if (response.deleteUser.msg === 'Deleted') {
      this.translationService
        .selectTranslate('users.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogRef.close();
        });
      this.userService.refreshUsers();
    } else {
      this.logger.error('User could not be deleted');
      this.translationService
        .selectTranslate('users.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(errorType: DynamicFormError, error: Error) {
    let translationKey;
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'users.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      this.isSubmitting = false;
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
  }
}
