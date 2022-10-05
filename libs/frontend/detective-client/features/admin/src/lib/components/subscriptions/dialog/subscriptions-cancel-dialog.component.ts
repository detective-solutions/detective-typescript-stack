/* eslint-disable sort-imports */
import { Component, Inject } from '@angular/core';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { StatusResponse, ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';
import { take } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { SubscriptionService } from '../../../services';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';

@Component({
  selector: 'subscriptions-cancel-dialog',
  styleUrls: ['subscriptions-cancel-dialog.component.scss'],
  templateUrl: 'subscriptions-cancel-dialog.component.html',
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
    this.subscriptionService
      .cancelSubscription()
      .pipe(take(1))
      .subscribe((subscriptionState: StatusResponse) => {
        this.handleResponse('cancel subscription', subscriptionState);
      });
    this.dialogRef.close();
  }

  cancelModal() {
    this.dialogRef.close();
  }

  private handleResponse(actionName: string, response: StatusResponse) {
    let toastMsg = 'actionFailed';
    let toastType = ToastType.ERROR;

    if (response.status) {
      toastMsg = 'actionSuccessful';
      toastType = ToastType.INFO;
      this.logger.info(`${actionName}: ${response.status}`);
    } else {
      this.logger.error(`${actionName}: ${response.status}`);
    }
    this.translationService
      .selectTranslate(`subscriptions.toastMessages.${toastMsg}`, {}, this.translationScope)
      .pipe(take(1))
      .subscribe((translation: string) => {
        this.toastService.showToast(translation, 'Close', toastType);
      });
    this.dialogRef.close();
  }
}
