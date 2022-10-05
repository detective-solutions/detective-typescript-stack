/* eslint-disable sort-imports */
import { Component, ElementRef, Inject, QueryList, ViewChildren } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { StatusResponse, ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { SubscriptionService } from '../../../services';
import { map, Observable, take } from 'rxjs';
import { IGetAllProductResponse } from '../../../models';

@Component({
  selector: 'subscriptions-upgrade-dialog',
  styleUrls: ['./subscriptions-upgrade-dialog.component.scss'],
  templateUrl: './subscriptions-upgrade-dialog.component.html',
})
export class SubscriptionUpgradeDialogComponent {
  isSubmitting = false;
  selectedPlan = '';

  availablePlans$: Observable<IGetAllProductResponse> = this.subscriptionService.getAllProductPlan().pipe(
    map((response: IGetAllProductResponse) => {
      return {
        prices: response.prices || [],
      };
    })
  );

  @ViewChildren('upgradeCard', { read: ElementRef }) upgradeCards!: QueryList<ElementRef>;

  constructor(
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly subscriptionService: SubscriptionService,
    private readonly dialogRef: MatDialogRef<SubscriptionUpgradeDialogComponent>,
    private readonly logger: LogService
  ) {}

  closeModal() {
    this.dialogRef.close();
  }

  lockUpgrade(planId: string) {
    this.selectedPlan = planId;
    this.upgradeCards.forEach((card) => {
      const cardElement = card.nativeElement;
      if (cardElement.id === this.selectedPlan) {
        cardElement.classList.add('selected-plan');
      } else {
        cardElement.classList.remove('selected-plan');
      }
    });
  }

  getPriceTag(amount: number, currency: string, iteration: string): string {
    return `${SubscriptionService.convertAmountToCurrencyString(amount, currency)} / ${iteration}`;
  }

  pushUpgrade() {
    this.subscriptionService
      .updateSubscription(this.selectedPlan)
      .pipe(take(1))
      .subscribe((subscriptionState: StatusResponse) => {
        this.handleResponse('update subscription', subscriptionState);
      });
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
