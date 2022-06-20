import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { IConnectionsTableDef, IGetAllConnectionsResponse } from '../../models';
import { ITableInput, SourceConnectionState, TableCellTypes } from '@detective.solutions/frontend/detective-client/ui';
import { Observable, Subject, Subscription, map, shareReplay, take } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';

import { ConnectionsDialogComponent } from './dialog';
import { ConnectionsService } from '../../services';
import { ISourceConnection } from '@detective.solutions/shared/data-access';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
})
export class ConnectionsComponent implements OnInit, OnDestroy {
  readonly fetchMoreDataByOffset$ = new Subject<number>();

  connections$!: Observable<IGetAllConnectionsResponse>;
  tableItems$!: Observable<ITableInput>;
  totalElementsCount$!: Observable<number>;

  readonly pageSize = 10;

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
    private readonly connectionsDialog: MatDialog,
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
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  openConnectionsDialog() {
    this.connectionsDialog.open(ConnectionsDialogComponent, { minWidth: 400 });
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
                buttons: [{ icon: 'edit' }, { icon: 'delete' }],
              },
            },
          } as IConnectionsTableDef);
        });
      });
    return tempTableItems;
  }
}
