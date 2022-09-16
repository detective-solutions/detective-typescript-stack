/* eslint-disable sort-imports */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, filter, map, take } from 'rxjs';
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
} from '../../models';
import { SubscriptionService } from '../../services';
import { SubscriptionCancelDialogComponent } from './dialog';

@Component({
  selector: 'subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  readonly pageSize = 10;
  tableItems$!: Observable<ITableInput>;
  totalElementsCount$!: Observable<number>;

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
    private readonly SubscriptionService: SubscriptionService,
    private readonly translationService: TranslocoService,
    private readonly matDialog: MatDialog,
    private readonly tableCellEventService: TableCellEventService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  ngOnInit() {
    this.tableItems$ = this.SubscriptionService.getInvoices().pipe(
      map((invoices: IInvoiceListResponse) => {
        return {
          tableItems: this.transformToTableStructure(invoices.data),
          totalElementsCount: invoices.count,
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

  openCancelDialog(componentToOpen?: ComponentType<SubscriptionDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? SubscriptionCancelDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
  }

  downloadInvoice(invoiceLink: string) {
    window.open(invoiceLink, '_blank');
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
