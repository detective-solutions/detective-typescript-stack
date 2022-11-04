/* eslint-disable sort-imports */
import { Component, Inject } from '@angular/core';
import { map, take } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { MaskingService } from '../../../services';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { IMasking, Mask } from '@detective.solutions/shared/data-access';

@Component({
  selector: 'masking-delete-dialog',
  styleUrls: ['masking-delete-dialog.component.scss'],
  templateUrl: 'masking-delete-dialog.component.html',
})
export class MaskingDeleteDialogComponent {
  readonly maskingToBeDeleted$ = this.maskingService.getMaskingById(this.dialogInputData.xid);
  readonly maskingName$ = this.maskingToBeDeleted$.pipe(map((value: IMasking) => value.name));

  isSubmitting = false;
  selectedMasking$!: IMasking;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { xid: string },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly maskingService: MaskingService,
    private readonly dialogRef: MatDialogRef<MaskingDeleteDialogComponent>,
    private readonly logger: LogService
  ) {
    this.maskingService.getMaskingById(this.dialogInputData.xid).subscribe((x) => {
      this.selectedMasking$ = x;
    });
  }

  getMaskIdsToDelete() {
    const columns = this.selectedMasking$.columns ?? [];
    const rows = this.selectedMasking$.rows ?? [];

    return {
      columns: columns.map((mask: Mask) => mask.xid ?? ''),
      rows: rows.map((mask: Mask) => mask.xid ?? ''),
    };
  }

  deleteMasking() {
    this.isSubmitting = true;

    const children = this.getMaskIdsToDelete();
    this.maskingService.deleteMasking({
      masking: this.dialogInputData.xid,
      columns: children.columns,
      rows: children.rows,
    });

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
