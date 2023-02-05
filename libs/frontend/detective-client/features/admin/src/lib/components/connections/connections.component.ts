import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import { BehaviorSubject, Observable, Subject, Subscription, filter, map, shareReplay, take, tap } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ConnectionDialogComponent, ConnectionsClickEvent, IConnectionsTableDef } from '../../models';
import { ConnectionsAddEditDialogComponent, ConnectionsDeleteDialogComponent } from './dialog';
import { ISearchConnectionsByTenantGQLResponse, SearchConnectionsByTenantGQL } from '../../graphql';
import {
  ITableCellEvent,
  NavigationEventService,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';

import { ComponentType } from '@angular/cdk/portal';
import { ISourceConnection } from '@detective.solutions/shared/data-access';
import { QueryRef } from 'apollo-angular';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';
import { buildSearchTermRegEx } from '@detective.solutions/frontend/shared/utils';

@Component({
  selector: 'connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
})
export class ConnectionsComponent implements OnInit, OnDestroy {
  readonly isLoading$ = new Subject<boolean>();
  readonly fetchMoreDataOnScroll$ = new Subject<number>();
  readonly connections$ = new BehaviorSubject<SourceConnectionDTO[]>([]);
  readonly tableItems$ = this.connections$.pipe(
    map((connections: SourceConnectionDTO[]) => this.transformToTableStructure(connections))
  );

  readonly addButtonClicks$ = new Subject<void>();
  readonly editButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === ConnectionsClickEvent.EDIT_CONNECTION),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );
  readonly deleteButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === ConnectionsClickEvent.DELETE_CONNECTION),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );
  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  totalElementsCount$!: Observable<number>;

  private searchConnectionsByTenantWatchQuery!: QueryRef<Response>;

  private readonly pageSize = 15;
  private readonly subscriptions = new Subscription();
  private readonly dialogDefaultConfig = {
    width: '650px',
    minWidth: '400px',
  };

  constructor(
    private readonly authService: AuthService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly tableCellEventService: TableCellEventService,
    private readonly searchConnectionsByTenantIdGql: SearchConnectionsByTenantGQL,
    private readonly navigationEventService: NavigationEventService,
    private readonly matDialog: MatDialog,
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  ngOnInit() {
    this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) => {
      // Fetch initial data
      this.searchConnections(authStatus.tenantId, '');
      // Listen to search input from navigation
      this.subscriptions.add(
        this.navigationEventService.searchInput$.subscribe((searchTerm: string) =>
          this.searchConnections(authStatus.tenantId, searchTerm)
        )
      );
    });

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataOnScroll$.subscribe((currentOffset: number) => this.getNextConnectionsPage(currentOffset))
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

  searchConnections(tenantId: string, searchTerm: string) {
    const searchParameters = {
      tenantId: tenantId,
      paginationOffset: 0,
      pageSize: this.pageSize,
      searchTerm: buildSearchTermRegEx(searchTerm),
    };

    if (!this.searchConnectionsByTenantWatchQuery) {
      this.searchConnectionsByTenantWatchQuery = this.searchConnectionsByTenantIdGql.watch(searchParameters, {
        notifyOnNetworkStatusChange: true,
      });
      this.subscriptions.add(
        this.searchConnectionsByTenantWatchQuery.valueChanges
          .pipe(
            tap(({ loading }) => this.isLoading$.next(loading)),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filter((response: any) => response?.data)
          )
          .subscribe(({ data }: { data: ISearchConnectionsByTenantGQLResponse }) => {
            this.connections$.next(data.querySourceConnection.map(SourceConnectionDTO.Build));
          })
      );
    } else {
      this.searchConnectionsByTenantWatchQuery.refetch(searchParameters);
    }
  }

  openConnectionsDialog(componentToOpen?: ComponentType<ConnectionDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? ConnectionsAddEditDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
  }

  private getNextConnectionsPage(currentOffset: number) {
    this.searchConnectionsByTenantWatchQuery.fetchMore({
      variables: { paginationOffset: currentOffset, pageSize: this.pageSize },
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
                id: connection.id,
                type: TableCellTypes.MULTI_TABLE_CELL,
                thumbnail: connection.iconSrc,
                name: connection.name,
                description: connection.description,
              },
            },
            status: {
              columnName: translation['statusColumn'],
              cellData: {
                id: connection.id,
                type: TableCellTypes.STATUS_TABLE_CELL,
                status: connection.status,
                message: 'An error occurred while initializing', // TODO: Get this value from database
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: connection.id,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(connection.lastUpdated),
              },
            },
            actions: {
              columnName: '',
              cellData: {
                id: connection.id,
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
