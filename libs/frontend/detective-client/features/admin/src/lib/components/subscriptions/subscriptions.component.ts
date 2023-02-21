import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { GetAllUsersCountGQL, IGetAllUsersCountGQLResponse } from '../../graphql';
import {
  IGetChangePaymentResponse,
  IGetProductResponse,
  IGetSubscriptionPaymentResponse,
  IInvoice,
  IInvoiceListResponse,
  IInvoiceTableDef,
  SubscriptionClickEvent,
  SubscriptionDialogComponent,
} from '../../models';
import {
  ITableCellEvent,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, Subject, Subscription, combineLatest, filter, map, shareReplay, take, tap } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { SubscriptionCancelDialogComponent, SubscriptionUpgradeDialogComponent } from './dialog';

import { ComponentType } from '@angular/cdk/portal';
import { QueryRef } from 'apollo-angular';
import { SubscriptionService } from '../../services';

@Component({
  selector: 'subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  readonly isLoading$ = new Subject<boolean>();
  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  readonly tableItems$ = this.subscriptionService
    .getInvoices()
    .pipe(map((invoices: IInvoiceListResponse) => this.transformToTableStructure(invoices.data)));
  readonly paymentMethod$ = this.subscriptionService.getSubscriptionPaymentMethod().pipe(
    map((payment: IGetSubscriptionPaymentResponse) => {
      return {
        id: payment.id || '',
        cardType: this.selectCardImage(payment.cardType),
        number: payment.number || '',
      };
    })
  );
  readonly activeUsers$ = this.getAllUsersCount().pipe(map((usersCount: number) => usersCount));
  readonly productInfo$ = this.subscriptionService.getProductDescription().pipe(
    map((product: IGetProductResponse) => {
      return {
        name: product.name || '',
        price: product.price || 0,
        currency: product.currency || '',
        iteration: product.iteration || '',
        userLimit: product.userLimit || 0,
        priceTag: SubscriptionService.convertAmountToCurrencyString(product.price, product.currency) || '',
      };
    })
  );
  readonly userRatio$ = combineLatest(
    [this.activeUsers$, this.productInfo$],
    (active: number, limit: IGetProductResponse) => {
      return (active / limit.userLimit) * 100;
    }
  );

  private getAllUsersCountWatchQuery!: QueryRef<Response>;

  private readonly subscriptions = new Subscription();
  private readonly dialogDefaultConfig = {
    width: '650px',
    minWidth: '400px',
    autoFocus: false, // Prevent autofocus on dialog button
  };

  constructor(
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly getAllUsersCountGQL: GetAllUsersCountGQL,
    private readonly subscriptionService: SubscriptionService,
    private readonly translationService: TranslocoService,
    private readonly matDialog: MatDialog,
    private readonly tableCellEventService: TableCellEventService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.tableCellEventService.iconButtonClicks$
        .pipe(
          filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === SubscriptionClickEvent.DOWNLOAD_INVOICE),
          map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
        )
        .subscribe((invoiceLink: string) => this.downloadInvoice(invoiceLink))
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  openCancelDialog(componentToOpen?: ComponentType<SubscriptionDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? SubscriptionCancelDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
  }

  openUpgradeDialog(componentToOpen?: ComponentType<SubscriptionDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? SubscriptionUpgradeDialogComponent, {
      ...this.dialogDefaultConfig,
      width: '850px',
      minWidth: '600px',
      ...config,
    });
  }

  changePayment() {
    this.subscriptionService
      .getChangePaymentPortal()
      .pipe(take(1))
      .subscribe((response: IGetChangePaymentResponse) => window.open(response.url, '_blank'));
  }

  private selectCardImage(card: string): string {
    const basePath = 'assets/images/payment';
    let result = '';
    switch (card) {
      case 'amex':
        result = basePath + '/amex.png';
        break;
      case 'visa':
        result = basePath + '/visa.png';
        break;
      case 'discover':
        result = basePath + '/discover.png';
        break;
      case 'jcb':
        result = basePath + '/jcb.png';
        break;
      case 'maestro':
        result = basePath + '/maestro.png';
        break;
      case 'master':
        result = basePath + '/mastercard.png';
        break;
      case 'sage':
        result = basePath + '/sage.png';
        break;
      case 'dinersclub':
        result = basePath + '/dinersclub.png';
        break;
      case 'western':
        result = basePath + '/westernunion.png';
        break;
      case 'paypal':
        result = basePath + '/paypal.png';
        break;
    }
    return result;
  }

  private downloadInvoice(invoiceLink: string) {
    window.open(invoiceLink, '_blank');
  }

  private getAllUsersCount(): Observable<number> {
    if (!this.getAllUsersCountWatchQuery) {
      this.getAllUsersCountWatchQuery = this.getAllUsersCountGQL.watch();
    }
    return this.getAllUsersCountWatchQuery.valueChanges.pipe(
      tap(({ loading }) => this.isLoading$.next(loading)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter((response: any) => response?.data),
      map(({ data }: { data: IGetAllUsersCountGQLResponse }) => data.aggregateUser.count)
    );
  }

  private transformToTableStructure(originalInvoiceData: IInvoice[]): IInvoiceTableDef[] {
    const tempTableItems = [] as IInvoiceTableDef[];
    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.subscriptions.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) =>
        originalInvoiceData.forEach((invoice: IInvoice) => {
          tempTableItems.push({
            period: {
              columnName: translation['period'],
              cellData: {
                id: invoice.invoice,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(invoice.period),
              },
            },
            invoice: {
              columnName: translation['invoice'],
              cellData: {
                id: invoice.invoice,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: SubscriptionService.checkInvoiceIdFallback(String(invoice.invoice)),
              },
            },
            interval: {
              columnName: translation['interval'],
              cellData: {
                id: invoice.invoice,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(invoice.interval),
              },
            },
            amount: {
              columnName: translation['amount'],
              cellData: {
                id: invoice.invoice,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: SubscriptionService.convertAmountToCurrencyString(invoice.amount, invoice.currency),
              },
            },
            status: {
              columnName: translation['status'],
              cellData: {
                id: invoice.invoice,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(invoice.status),
              },
            },
            actions: {
              columnName: translation['download'],
              cellData: {
                id: invoice.invoice_pdf,
                type: TableCellTypes.ICON_BUTTON_TABLE_CELL,
                buttons: [{ icon: 'download', clickEventKey: SubscriptionClickEvent.DOWNLOAD_INVOICE }],
              },
            },
          } as IInvoiceTableDef);
        })
      );
    return tempTableItems;
  }
}
