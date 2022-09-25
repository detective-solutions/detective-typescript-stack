/* eslint-disable sort-imports */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, filter, map, take, combineLatest, shareReplay } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import {
  ITableCellEvent,
  ITableInput,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import {
  IInvoiceTableDef,
  IInvoice,
  IInvoiceListResponse,
  SubscriptionClickEvent,
  SubscriptionDialogComponent,
  IGetAllUsersResponse,
  IGetProductResponse,
  IGetSubscriptionPaymentResponse,
  IGetChangePaymentResponse,
} from '../../models';
import { SubscriptionService } from '../../services';
import { SubscriptionCancelDialogComponent, SubscriptionUpgradeDialogComponent } from './dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  readonly pageSize = 10;

  readonly activeUsers$: Observable<number> = this.SubscriptionService.getAllUsers().pipe(
    map((response: IGetAllUsersResponse) => response.totalElementsCount)
  );

  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  tableItems$!: Observable<ITableInput>;
  totalElementsCount$!: Observable<number>;
  paymentMethod$!: Observable<IGetSubscriptionPaymentResponse>;
  productInfo$!: Observable<IGetProductResponse>;
  userRatio$!: Observable<number>;

  private readonly subscriptions = new Subscription();

  readonly downloadButtonClick$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === SubscriptionClickEvent.DOWNLOAD_INVOICE),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );

  private readonly dialogDefaultConfig = {
    width: '650px',
    minWidth: '400px',
  };

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly SubscriptionService: SubscriptionService,
    private readonly translationService: TranslocoService,
    private readonly matDialog: MatDialog,
    private readonly tableCellEventService: TableCellEventService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  ngOnInit() {
    this.productInfo$ = this.SubscriptionService.getProductDescription().pipe(
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

    this.userRatio$ = combineLatest(
      [this.activeUsers$, this.productInfo$],
      (active: number, limit: IGetProductResponse) => {
        return (active / limit.userLimit) * 100;
      }
    );

    this.tableItems$ = this.SubscriptionService.getInvoices().pipe(
      map((invoices: IInvoiceListResponse) => {
        return {
          tableItems: this.transformToTableStructure(invoices.data),
          totalElementsCount: invoices.count,
        };
      })
    );

    this.paymentMethod$ = this.SubscriptionService.getSubscriptionPaymentMethod().pipe(
      map((payment: IGetSubscriptionPaymentResponse) => {
        return {
          id: payment.id || '',
          cardType: this.selectCardImage(payment.cardType),
          number: payment.number || '',
        };
      })
    );

    this.subscriptions.add(
      this.downloadButtonClick$.subscribe((invoiceLink: string) => this.downloadInvoice(invoiceLink))
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  selectCardImage(card: string): string {
    const base = 'assets/images/payment';
    let path = base + '/visa.png';
    switch (card) {
      case 'amex':
        path = base + '/amex.png';
        break;
      case 'visa':
        path = base + '/visa.png';
        break;
      case 'discover':
        path = base + '/discover.png';
        break;
      case 'jcb':
        path = base + '/jcb.png';
        break;
      case 'maestro':
        path = base + '/maestro.png';
        break;
      case 'master':
        path = base + '/mastercard.png';
        break;
      case 'sage':
        path = base + '/sage.png';
        break;
      case 'dinersclub':
        path = base + '/dinersclub.png';
        break;
      case 'western':
        path = base + '/westernunion.png';
        break;
      case 'paypal':
        path = base + '/paypal.png';
        break;
    }
    return path;
  }

  openCancelDialog(componentToOpen?: ComponentType<SubscriptionDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? SubscriptionCancelDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
  }

  openUpgradeDialog(componentToOpen?: ComponentType<SubscriptionDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? SubscriptionUpgradeDialogComponent, {
      ...{
        width: '850px',
        minWidth: '600px',
      },
      ...config,
    });
  }

  downloadInvoice(invoiceLink: string) {
    window.open(invoiceLink, '_blank');
  }

  changePayment() {
    this.SubscriptionService.getChangePaymentPortal()
      .pipe(take(1))
      .subscribe((response: IGetChangePaymentResponse) => {
        window.open(response.url, '_blank');
      });
  }

  private transformToTableStructure(originalInvoiceData: IInvoice[]): IInvoiceTableDef[] {
    const tempTableItems = [] as IInvoiceTableDef[];
    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.subscriptions.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
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
                text: SubscriptionService.invoiceId(String(invoice.invoice)),
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
        });
      });
    return tempTableItems;
  }
}
