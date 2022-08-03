import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { take } from 'rxjs';

@Component({
  selector: 'casefile-create-dialog',
  styleUrls: ['casefile-create-dialog.component.scss'],
  templateUrl: 'casefile-create-dialog.component.html',
})
export class CasefileCreateDialogComponent {
  isSubmitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { id: string },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly dialogRef: MatDialogRef<CasefileCreateDialogComponent>,
    private readonly logger: LogService
  ) {}

  createCasefile() {
    console.log('CREATE CASEFILE');
    this.isSubmitting = true;
  }

  private handleError(error: Error) {
    this.isSubmitting = false;
    this.logger.error('Encountered an error while submitting casefile creation request');
    console.error(error);
    this.translationService
      .selectTranslate('casefileList.toastMessages.formSubmitError', {}, this.translationScope)
      .pipe(take(1))
      .subscribe((translation: string) => {
        this.toastService.showToast(translation, 'Close', ToastType.ERROR);
      });
    this.dialogRef.close();
  }
}
