import { Component, Inject } from '@angular/core';
import { EMPTY, Subject, catchError, take } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { StatusResponse, ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { MatDialogRef } from '@angular/material/dialog';
import { SubscriptionService } from '../../../services';

@Component({
  selector: 'subscriptions-cancel-dialog',
  styleUrls: ['subscriptions-cancel-dialog.component.scss'],
  templateUrl: 'subscriptions-cancel-dialog.component.html',
})
export class SubscriptionCancelDialogComponent {
  readonly isLoading$ = new Subject<boolean>();

  constructor(
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly subscriptionService: SubscriptionService,
    private readonly dialogRef: MatDialogRef<SubscriptionCancelDialogComponent>,
    private readonly logger: LogService
  ) {}

  cancelSubscription() {
    this.isLoading$.next(true);
    this.subscriptionService
      .cancelSubscription()
      .pipe(
        take(1),
        catchError(() => {
          this.isLoading$.next(false);
          return EMPTY;
        })
      )
      .subscribe((subscriptionState: StatusResponse) => {
        this.handleResponse('cancel subscription', subscriptionState);
        this.isLoading$.next(false);
        this.closeModal();
      });
  }

  closeModal() {
    this.dialogRef.close();
  }

  private handleResponse(actionName: string, response: StatusResponse) {
    let toastMessage = 'actionFailed';
    let toastType = ToastType.ERROR;

    if (response.status) {
      toastMessage = 'actionSuccessful';
      toastType = ToastType.INFO;
      this.logger.info(`${actionName}: ${response.status}`);
    } else {
      this.logger.error(`${actionName}: ${response.status}`);
    }
    this.translationService
      .selectTranslate(`subscriptions.toastMessages.${toastMessage}`, {}, this.translationScope)
      .pipe(take(1))
      .subscribe((translation: string) => {
        this.toastService.showToast(translation, 'Close', toastType);
        this.closeModal();
      });
  }
}
