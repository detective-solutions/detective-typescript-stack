import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ConnectionsAddEditDialogComponent, ConnectionsDeleteDialogComponent } from './dialog';
import { ConnectionsClickEvent, IConnectionsTableDef, IGetAllConnectionsResponse } from '../../models';
import {
  ITableCellEvent,
  ITableInput,
  SourceConnectionState,
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

  connections$!: Observable<IGetAllConnectionsResponse>;
  tableItems$!: Observable<ITableInput>;
  totalElementsCount$!: Observable<number>;

  private readonly initialPageOffset = 0;
  private readonly subscriptions = new Subscription();

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
    this.connections$ = this.connectionsService.getAllConnections(this.initialPageOffset, this.pageSize);

    this.tableItems$ = this.connections$.pipe(
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
        this.openConnectionsDialog(ConnectionsAddEditDialogComponent, { data: { id: connectionId }, minWidth: 400 })
      )
    );
    this.subscriptions.add(
      this.deleteButtonClicks$.subscribe((connectionId: string) =>
        this.openConnectionsDialog(ConnectionsDeleteDialogComponent, { data: { id: connectionId }, minWidth: 300 })
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openConnectionsDialog(componentToOpen?: ComponentType<any>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? ConnectionsAddEditDialogComponent, config ?? { minWidth: 400 });
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
            state: {
              columnName: translation['stateColumn'],
              cellData: {
                id: connection.xid,
                type: TableCellTypes.STATE_TABLE_CELL,
                state: SourceConnectionState.READY, // TODO: Get this value from database
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
