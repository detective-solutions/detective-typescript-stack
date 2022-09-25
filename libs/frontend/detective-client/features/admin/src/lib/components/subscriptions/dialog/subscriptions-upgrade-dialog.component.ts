/* eslint-disable sort-imports */
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { SubscriptionService } from '../../../services';
import { map, Observable, take } from 'rxjs';
import { IGetAllProductResponse } from '../../../models';

@Component({
  selector: 'subscriptions-upgrade-dialog',
  styleUrls: ['subscriptions-upgrade-dialog.component.scss'],
  templateUrl: 'subscriptions-upgrade-dialog.component.html',
})
export class SubscriptionUpgradeDialogComponent implements OnInit {
  isSubmitting = false;
  selectedPlan = '';
  availablePlans$!: Observable<IGetAllProductResponse>;

  constructor(
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly subscriptionService: SubscriptionService,
    private readonly dialogRef: MatDialogRef<SubscriptionUpgradeDialogComponent>,
    private readonly logger: LogService
  ) {}

  ngOnInit() {
    this.availablePlans$ = this.subscriptionService.getAllProductPlan().pipe(
      map((response: IGetAllProductResponse) => {
        return {
          prices: response.prices || [],
        };
      })
    );
  }

  closeModal() {
    this.dialogRef.close();
  }

  lockUpgrade(planId: string) {
    this.selectedPlan = planId;
    document.querySelectorAll('.mat-card')?.forEach((element) => {
      element.classList.remove('selected-plan');
    });

    const locked = document.getElementById(planId);
    locked?.classList.add('selected-plan');
  }

  getPriceTag(amount: number, currency: string, iteration: string) {
    return `${SubscriptionService.convertAmountToCurrencyString(amount, currency)} / ${iteration}`;
  }

  pushUpgrade() {
    this.subscriptionService
      .updateSubscription(this.selectedPlan)
      .pipe(take(1))
      .subscribe((subscriptionState: any) => console.log(subscriptionState));
    this.dialogRef.close();
  }
  private handleError(error: Error) {
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
