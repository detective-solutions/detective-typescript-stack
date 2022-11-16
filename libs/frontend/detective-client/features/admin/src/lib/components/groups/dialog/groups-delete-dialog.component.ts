/* eslint-disable sort-imports */
import { Component, Inject } from '@angular/core';
import { catchError, EMPTY, map, take } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';
import { DynamicFormError } from '@detective.solutions/frontend/shared/dynamic-form';
import { IDeleteUserGroupGQLResponse } from '../../../graphql';
import { MaskingService, UsersService } from '../../../services';
import { IMask, IMasking, IUserGroup } from '@detective.solutions/shared/data-access';
import { IMaskingDeleteInput } from '../../../models';

/* eslint-disable @typescript-eslint/no-explicit-any */
@Component({
  selector: 'groups-delete-dialog',
  styleUrls: ['groups-delete-dialog.component.scss'],
  templateUrl: 'groups-delete-dialog.component.html',
})
export class GroupsDeleteComponent {
  readonly maskingsToDelete!: IMaskingDeleteInput;
  readonly groupToBeDeleted$ = this.userService.getUserGroupById(this.dialogInputData.id);
  readonly groupName$ = this.groupToBeDeleted$.pipe(map((value: IUserGroup) => value.name));

  readonly maskingsToBeDeleted$ = this.userService.getMaskingsOfUserGroup(this.dialogInputData.id);
  readonly relatedMaskings$ = this.maskingsToBeDeleted$.pipe(map((value: any) => value));

  isSubmitting = false;
  maskingsDeleteInput!: IMaskingDeleteInput[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { id: string },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly maskingService: MaskingService,
    private readonly dialogRef: MatDialogRef<GroupsDeleteComponent>,
    private readonly userService: UsersService,
    private readonly logger: LogService
  ) {
    this.relatedMaskings$.subscribe(
      (maskings: IMasking[]) => (this.maskingsDeleteInput = this.generateMaskingDeleteInput(maskings))
    );
  }

  generateMaskingDeleteInput(maskings: IMasking[]): IMaskingDeleteInput[] {
    const maskingDeleteInput: IMaskingDeleteInput[] = [];
    maskings.forEach((masking: IMasking) => {
      maskingDeleteInput.push({
        masking: masking.xid,
        rows: masking.rows?.map((mask: IMask) => mask.xid ?? '') ?? [],
        columns: masking.columns?.map((mask: IMask) => mask.xid ?? '') ?? [],
      });
    });
    return maskingDeleteInput;
  }

  deleteUserGroup() {
    this.isSubmitting = true;
    this.userService
      .deleteUserGroup(this.dialogInputData.id)
      .pipe(
        take(1),
        catchError((error: Error) => {
          this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error);
          return EMPTY;
        })
      )
      .subscribe((response: IDeleteUserGroupGQLResponse) => {
        if (!Object.keys(response).includes('error')) {
          this.maskingsDeleteInput.forEach((maskingDeleteInput: IMaskingDeleteInput) =>
            this.maskingService
              .deleteMasking(maskingDeleteInput)
              .subscribe((response: any) => console.log('mask delete: ', response))
          );
        }
        this.handleResponse(response);
      });
  }

  private handleResponse(response: IDeleteUserGroupGQLResponse) {
    this.isSubmitting = false;
    if (response.deleteUserGroup.msg === 'Deleted') {
      this.translationService
        .selectTranslate('groups.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogRef.close();
        });
      this.userService.refreshUserGroups();
    } else {
      this.logger.error('Group could not be deleted');
      this.translationService
        .selectTranslate('groups.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(errorType: DynamicFormError, error: Error) {
    let translationKey;
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'groups.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      this.isSubmitting = false;
      translationKey = 'groups.toastMessages.formSubmitError';
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
