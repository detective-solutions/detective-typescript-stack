import { AccessState, ITableInput, TableCellTypes } from '@detective.solutions/frontend/detective-client/ui';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IConnectionsTableDef, IGetAllConnectionsResponse } from '../../interfaces';
import { Observable, Subject, Subscription, map } from 'rxjs';

import { ConnectionsService } from '../../services';
import { ISourceConnection } from '@detective.solutions/shared/data-access';

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

  constructor(private readonly connectionsService: ConnectionsService) {}

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

  private transformToTableStructure(originalConnection: ISourceConnection[]): IConnectionsTableDef[] {
    const tempTableItems = [] as IConnectionsTableDef[];
    // TODO: Translate column headers
    originalConnection.forEach((connection: ISourceConnection) => {
      tempTableItems.push({
        dataSourceInfo: {
          columnName: '',
          cellData: {
            id: connection.id,
            type: TableCellTypes.MULTI_TABLE_CELL,
            thumbnailSrc: connection.iconSrc,
            name: connection.name,
            description: connection.description,
          },
        },
        state: {
          columnName: 'Access',
          cellData: {
            id: connection.id,
            type: TableCellTypes.ACCESS_TABLE_CELL,
            accessState: AccessState.NO_ACCESS,
          },
        },
        lastUpdated: {
          columnName: 'Last Updated',
          cellData: {
            id: connection.id,
            type: TableCellTypes.DATE_TABLE_CELL,
            date: String(connection.lastUpdated),
          },
        },
        actions: {
          columnName: 'Actions',
          cellData: {
            id: connection.id,
            type: TableCellTypes.ICON_BUTTON_TABLE_CELL,
            buttons: [
              { icon: 'edit', tooltipText: 'test' },
              { icon: 'delete', tooltipText: 'test2' },
            ],
          },
        },
      } as IConnectionsTableDef);
    });
    return tempTableItems;
  }
}
