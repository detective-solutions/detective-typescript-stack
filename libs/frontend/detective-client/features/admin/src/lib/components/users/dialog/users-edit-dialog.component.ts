import { Component, Inject, OnInit } from '@angular/core';
import { EMPTY, catchError, take } from 'rxjs';
import { IUser, UserRole } from '@detective.solutions/shared/data-access';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { DynamicFormError } from '@detective.solutions/frontend/shared/dynamic-form';
import { IUpdateUserRoleGQLResponse } from '../../../graphql';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { UserRoleInterface } from '../../../models';
import { UsersService } from '../../../services';

@Component({
  selector: 'users-edit-dialog',
  styleUrls: ['users-edit-dialog.component.scss'],
  templateUrl: 'users-edit-dialog.component.html',
})
export class UserEditDialogComponent implements OnInit {
  readonly isAddDialog = !this.dialogInputData?.id;
  readonly roles = [
    { roleId: 1, name: UserRole.BASIC },
    { roleId: 2, name: UserRole.ADMIN },
  ];

  currentUser!: IUser;
  isSubmitting = false;
  isLoaded = false;
  userRoleForm!: UntypedFormGroup;
  currentRole!: { roleId: number; name: string };

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { id: string },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly userService: UsersService,
    private readonly dialogRef: MatDialogRef<UserEditDialogComponent>,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly logger: LogService
  ) {}

  ngOnInit() {
    this.userService.getUserById(this.dialogInputData.id).subscribe((user: IUser) => {
      this.currentUser = user;
      this.currentRole = this.roles.filter((value) => value.name === this.currentUser.role)[0];
      this.isLoaded = true;

      this.userRoleForm = this.formBuilder.group({
        role: [this.currentRole.roleId, Validators.required],
      });
    });
  }

  submitForm() {
    this.isSubmitting = true;
    const now = new Date().toISOString();
    const updateData = {
      role: this.roles.filter((role: UserRoleInterface) => role.roleId === this.userRoleForm.value.role)[0].name,
      lastUpdated: now,
    };
    this.userService
      .updateUserRole(this.currentUser.id, updateData)
      .pipe(
        take(1),
        catchError((error: Error) => {
          this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error);
          return EMPTY;
        })
      )
      .subscribe((response: IUpdateUserRoleGQLResponse) => {
        this.handleResponse(response);
      });
  }

  private handleResponse(response: IUpdateUserRoleGQLResponse) {
    this.isSubmitting = false;
    if (!Object.keys(response).includes('error')) {
      this.translationService
        .selectTranslate('users.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogRef.close();
        });
      this.userService.refreshUsers();
    } else {
      this.logger.error('User could not be edited');
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
