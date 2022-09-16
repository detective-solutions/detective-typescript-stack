/* eslint-disable sort-imports */
import { Component, Inject } from '@angular/core';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';
import { take } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { SubscriptionService } from '../../../services';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';

@Component({
  selector: 'subscription-cancel-dialog',
  styleUrls: ['subscription-cancel-dialog.component.scss'],
  templateUrl: 'subscription-cancel-dialog.component.html',
})
export class SubscriptionCancelDialogComponent {
  isSubmitting = false;

  constructor(
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly subscriptionService: SubscriptionService,
    private readonly dialogRef: MatDialogRef<SubscriptionCancelDialogComponent>,
    private readonly logger: LogService
  ) {}

  cancelSubscription() {
    this.isSubmitting = true;
    this.subscriptionService.cancelSubscription();
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
