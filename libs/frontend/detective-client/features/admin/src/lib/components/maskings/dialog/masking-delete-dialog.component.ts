import { Component, Inject } from '@angular/core';
import { EMPTY, catchError, map, take } from 'rxjs';
import { IMask, IMasking } from '@detective.solutions/shared/data-access';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { DynamicFormError } from '@detective.solutions/frontend/shared/dynamic-form';
import { IDeleteMaskingGQLResponse } from '../../../graphql';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { MaskingService } from '../../../services';

@Component({
  selector: 'masking-delete-dialog',
  styleUrls: ['masking-delete-dialog.component.scss'],
  templateUrl: 'masking-delete-dialog.component.html',
})
export class MaskingDeleteDialogComponent {
  readonly maskingToBeDeleted$ = this.maskingService.getMaskingById(this.dialogInputData.xid);
  readonly maskingName$ = this.maskingToBeDeleted$.pipe(map((value: IMasking) => value.name));

  isSubmitting = false;
  selectedMasking!: IMasking;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { xid: string },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly maskingService: MaskingService,
    private readonly dialogRef: MatDialogRef<MaskingDeleteDialogComponent>,
    private readonly logger: LogService
  ) {
    this.maskingService.getMaskingById(this.dialogInputData.xid).subscribe((selectedMasking: IMasking) => {
      this.selectedMasking = selectedMasking;
    });
  }

  getMaskIdsToDelete() {
    const columns = this.selectedMasking.columns ?? [];
    const rows = this.selectedMasking.rows ?? [];

    return {
      columns: columns.map((mask: IMask) => mask.xid ?? ''),
      rows: rows.map((mask: IMask) => mask.xid ?? ''),
    };
  }

  deleteMasking() {
    this.isSubmitting = true;

    const children = this.getMaskIdsToDelete();
    this.maskingService
      .deleteMasking({
        masking: this.dialogInputData.xid,
        columns: children.columns,
        rows: children.rows,
      })
      .pipe(
        take(1),
        catchError((error: Error) => {
          this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error);
          return EMPTY;
        })
      )
      .subscribe((response: IDeleteMaskingGQLResponse) => this.handleResponse(response));
  }

  private handleResponse(response: IDeleteMaskingGQLResponse) {
    this.isSubmitting = false;
    if (!Object.keys(response).includes('error')) {
      this.translationService
        .selectTranslate('maskings.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogRef.close();
        });
      this.maskingService.refreshMaskings();
    } else {
      this.logger.error('Masking could not be edited');
      this.translationService
        .selectTranslate('maskings.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(errorType: DynamicFormError, error: Error) {
    let translationKey;
    this.logger.error(String(error));
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'maskings.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      this.isSubmitting = false;
      translationKey = 'maskings.toastMessages.formSubmitError';
      this.logger.error('Encountered an error while submitting the form data');
    }

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
