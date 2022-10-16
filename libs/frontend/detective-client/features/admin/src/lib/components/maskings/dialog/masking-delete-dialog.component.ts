/* eslint-disable sort-imports */
import { Component, Inject } from '@angular/core';
import { map, take } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { MaskingService } from '../../../services';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { IGetMaskingByIdResponse } from '../../../models/get-masking-by-id-response.interface';

@Component({
  selector: 'masking-delete-dialog',
  styleUrls: ['masking-delete-dialog.component.scss'],
  templateUrl: 'masking-delete-dialog.component.html',
})
export class MaskingDeleteDialogComponent {
  readonly maskingToBeDeleted$ = this.maskingService.getMaskingById(this.dialogInputData.xid);
  readonly maskingName$ = this.maskingToBeDeleted$.pipe(map((value: IGetMaskingByIdResponse) => value.name));

  isSubmitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { xid: string },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly maskingService: MaskingService,
    private readonly dialogRef: MatDialogRef<MaskingDeleteDialogComponent>,
    private readonly logger: LogService
  ) {}

  deleteMasking() {
    this.isSubmitting = true;
    // this.maskingService.deleteMasking(this.dialogInputData.id, 'test name');
    this.dialogRef.close();
  }

  private handleError(error: Error) {
    this.isSubmitting = false;
    this.logger.error('Encountered an error while submitting connection deletion request');
    console.error(error);
    this.translationService
      .selectTranslate('connections.toastMessages.formSubmitError', {}, this.translationScope)
      .pipe(take(1))
      .subscribe((translation: string) => {
        this.toastService.showToast(translation, 'Close', ToastType.ERROR);
      });
    this.dialogRef.close();
  }
}
