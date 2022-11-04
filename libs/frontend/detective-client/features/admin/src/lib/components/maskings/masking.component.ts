/* eslint-disable sort-imports */
import { IGetAllMaskingsResponse, IMaskingTableDef, MaskingClickEvent, MaskingDialogComponent } from '../../models';
import {
  ITableCellEvent,
  ITableInput,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription, map, shareReplay, take, filter } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { MaskingService } from '../../services';
import { IMasking } from '@detective.solutions/shared/data-access';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MaskingDeleteDialogComponent, MaskingAddEditDialogComponent } from './dialog';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';

@Component({
  selector: 'maskings',
  templateUrl: './masking.component.html',
  styleUrls: ['./masking.component.scss'],
})
export class MaskingsComponent implements OnDestroy, OnInit {
  readonly pageSize = 10;
  readonly fetchMoreDataByOffset$ = new Subject<number>();

  readonly editButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === MaskingClickEvent.EDIT_MASKING),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );
  readonly deleteButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === MaskingClickEvent.DELETE_MASKING),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );

  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  tableItems$!: Observable<ITableInput>;
  totalElementsCount$!: Observable<number>;

  private readonly subscriptions = new Subscription();
  private readonly initialPageOffset = 0;

  private readonly dialogDefaultConfig = {
    width: '60%',
    minWidth: '400px',
  };

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly maskingService: MaskingService,
    private readonly tableCellEventService: TableCellEventService,
    private readonly matDialog: MatDialog,
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  ngOnInit() {
    this.tableItems$ = this.maskingService.getAllMaskings(this.initialPageOffset, this.pageSize).pipe(
      map((maskings: IGetAllMaskingsResponse) => {
        return {
          tableItems: this.transformToTableStructure(maskings.maskings),
          totalElementsCount: maskings.totalElementsCount,
        };
      })
    );

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataByOffset$.subscribe((pageOffset: number) =>
        this.maskingService.getAllMaskingsNextPage(pageOffset, this.pageSize)
      )
    );

    this.subscriptions.add(
      this.editButtonClicks$.subscribe((maskingId: string) =>
        this.openMaskingDialog(MaskingAddEditDialogComponent, {
          data: { xid: maskingId },
        })
      )
    );

    this.subscriptions.add(
      this.deleteButtonClicks$.subscribe((maskingId: string) =>
        this.openMaskingDialog(MaskingDeleteDialogComponent, {
          data: { xid: maskingId },
          width: '500px',
        })
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  openMaskingDialog(componentToOpen?: ComponentType<MaskingDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? MaskingAddEditDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
  }

  private transformToTableStructure(originalMasking: IMasking[]): IMaskingTableDef[] {
    const tempTableItems = [] as IMaskingTableDef[];
    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.maskings.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
        originalMasking.forEach((maskings: IMasking) => {
          tempTableItems.push({
            maskingInfo: {
              columnName: '',
              cellData: {
                id: maskings.xid,
                type: TableCellTypes.MULTI_TABLE_CELL_WITHOUT_THUMBNAIL,
                name: maskings.name,
                description: String(maskings.description),
              },
            },
            table: {
              columnName: translation['tableNameColumn'],
              cellData: {
                id: maskings.xid,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(maskings.table.name),
              },
            },
            userGroups: {
              columnName: translation['userGroupsColumn'],
              cellData: {
                id: maskings.xid,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(maskings.groups?.map((x) => x.name).join(', ')),
              },
            },
            lastUpdatedBy: {
              columnName: translation['lastUpdatedByColumn'],
              cellData: {
                id: maskings.xid,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(maskings.lastUpdatedBy?.firstname) + ' ' + String(maskings.lastUpdatedBy?.lastname),
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: maskings.xid,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(maskings.lastUpdated),
              },
            },
            actions: {
              columnName: '',
              cellData: {
                id: maskings.xid,
                type: TableCellTypes.ICON_BUTTON_TABLE_CELL,
                buttons: [
                  { icon: 'edit', clickEventKey: MaskingClickEvent.EDIT_MASKING },
                  { icon: 'delete', clickEventKey: MaskingClickEvent.DELETE_MASKING },
                ],
              },
            },
          } as IMaskingTableDef);
        });
      });
    return tempTableItems;
  }
}
