import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  ConnectionDialogComponent,
  ConnectionsClickEvent,
  IConnectionsTableDef,
  IGetAllConnectionsResponse,
} from '../../models';
import { ConnectionsAddEditDialogComponent, ConnectionsDeleteDialogComponent } from './dialog';
import {
  ITableCellEvent,
  ITableInput,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, Subject, Subscription, filter, map, shareReplay, take } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ComponentType } from '@angular/cdk/portal';
import { ConnectionsService } from '../../services';
import { ISourceConnection } from '@detective.solutions/shared/data-access';

@Component({
  selector: 'connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
})
export class ConnectionsComponent implements OnInit, OnDestroy {
  readonly pageSize = 10;
  readonly fetchMoreDataByOffset$ = new Subject<number>();

  readonly editButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === ConnectionsClickEvent.EDIT_CONNECTION),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );
  readonly deleteButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === ConnectionsClickEvent.DELETE_CONNECTION),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );

  tableItems$!: Observable<ITableInput>;
  totalElementsCount$!: Observable<number>;

  private readonly subscriptions = new Subscription();
  private readonly initialPageOffset = 0;
  private readonly dialogDefaultConfig = {
    width: '650px',
    minWidth: '400px',
  };

  isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly connectionsService: ConnectionsService,
    private readonly tableCellEventService: TableCellEventService,
    private readonly matDialog: MatDialog,
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  ngOnInit() {
    this.tableItems$ = this.connectionsService.getAllConnections(this.initialPageOffset, this.pageSize).pipe(
      map((connections: IGetAllConnectionsResponse) => {
        return {
          tableItems: this.transformToTableStructure(connections.connections),
          totalElementsCount: connections.totalElementsCount,
        };
      })
    );

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataByOffset$.subscribe((pageOffset: number) =>
        this.connectionsService.getAllConnectionsNextPage(pageOffset, this.pageSize)
      )
    );

    this.subscriptions.add(
      this.editButtonClicks$.subscribe((connectionId: string) =>
        this.openConnectionsDialog(ConnectionsAddEditDialogComponent, {
          data: { id: connectionId },
        })
      )
    );

    this.subscriptions.add(
      this.deleteButtonClicks$.subscribe((connectionId: string) =>
        this.openConnectionsDialog(ConnectionsDeleteDialogComponent, {
          data: { id: connectionId },
          width: '500px',
        })
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  openConnectionsDialog(componentToOpen?: ComponentType<ConnectionDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? ConnectionsAddEditDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
  }

  private transformToTableStructure(originalConnection: ISourceConnection[]): IConnectionsTableDef[] {
    const tempTableItems = [] as IConnectionsTableDef[];

    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.connections.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
        originalConnection.forEach((connection: ISourceConnection) => {
          tempTableItems.push({
            dataSourceInfo: {
              columnName: '',
              cellData: {
                id: connection.xid,
                type: TableCellTypes.MULTI_TABLE_CELL,
                thumbnailSrc: connection.iconSrc,
                name: connection.name,
                description: connection.description,
              },
            },
            status: {
              columnName: translation['statusColumn'],
              cellData: {
                id: connection.xid,
                type: TableCellTypes.STATUS_TABLE_CELL,
                status: connection.status,
                message: 'An error occurred while initializing', // TODO: Get this value from database
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: connection.xid,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(connection.lastUpdated),
              },
            },
            actions: {
              columnName: '',
              cellData: {
                id: connection.xid,
                type: TableCellTypes.ICON_BUTTON_TABLE_CELL,
                buttons: [
                  { icon: 'edit', clickEventKey: ConnectionsClickEvent.EDIT_CONNECTION },
                  { icon: 'delete', clickEventKey: ConnectionsClickEvent.DELETE_CONNECTION },
                ],
              },
            },
          } as IConnectionsTableDef);
        });
      });
    return tempTableItems;
  }
}
