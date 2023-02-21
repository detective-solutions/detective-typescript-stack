import { Component, ElementRef, Inject, QueryList, ViewChildren } from '@angular/core';
import { EMPTY, Subject, catchError, map, take } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { StatusResponse, ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { IGetAllProductResponse } from '../../../models';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { MatDialogRef } from '@angular/material/dialog';
import { SubscriptionService } from '../../../services';

@Component({
  selector: 'subscriptions-upgrade-dialog',
  styleUrls: ['./subscriptions-upgrade-dialog.component.scss'],
  templateUrl: './subscriptions-upgrade-dialog.component.html',
})
export class SubscriptionUpgradeDialogComponent {
  readonly isLoading$ = new Subject<boolean>();
  readonly availablePlans$ = this.subscriptionService.getAllProductPlan().pipe(
    map((response: IGetAllProductResponse) => {
      return {
        prices: response.prices || [],
      };
    })
  );

  private selectedPlanId!: string;

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
    this.selectedPlanId = planId;
    const selectedPlanClass = 'selected-plan';
    this.upgradeCards.forEach((card: ElementRef) => {
      card.nativeElement.id === this.selectedPlanId
        ? card.nativeElement.classList.add(selectedPlanClass)
        : card.nativeElement.classList.remove(selectedPlanClass);
    });
  }

  getPriceTag(amount: number, currency: string, iteration: string): string {
    return `${SubscriptionService.convertAmountToCurrencyString(amount, currency)} / ${iteration}`;
  }

  pushUpgrade() {
    this.isLoading$.next(true);
    this.subscriptionService
      .updateSubscription(this.selectedPlanId)
      .pipe(
        take(1),
        catchError(() => {
          this.isLoading$.next(false);
          return EMPTY;
        })
      )
      .subscribe((subscriptionState: StatusResponse) => this.handleResponse('update subscription', subscriptionState));
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
        this.isLoading$.next(false);
        this.closeModal();
      });
  }
}
