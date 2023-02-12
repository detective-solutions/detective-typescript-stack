import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  filter,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ConnectionDialogComponent, ConnectionsClickEvent, IConnectionsTableDef } from '../../models';
import { ConnectionsAddEditDialogComponent, ConnectionsDeleteDialogComponent } from './dialog';
import {
  GetConnectionByIdGQL,
  IGetConnectionByIdGQLResponse,
  ISearchConnectionsByTenantGQLResponse,
  SearchConnectionsByTenantGQL,
} from '../../graphql';
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

  private searchConnectionsByTenantWatchQuery!: QueryRef<Response>;
  private getConnectionByIdWatchQuery!: QueryRef<Response>;

  private readonly pageSize = 15;
  private readonly subscriptions = new Subscription();
  private readonly dialogDefaultConfig = {
    width: '650px',
    minWidth: '400px',
    autoFocus: false, // Prevent autofocus on dialog button
  };

  constructor(
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly authService: AuthService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly getConnectionByIdGQL: GetConnectionByIdGQL,
    private readonly matDialog: MatDialog,
    private readonly navigationEventService: NavigationEventService,
    private readonly searchConnectionsByTenantIdGQL: SearchConnectionsByTenantGQL,
    private readonly tableCellEventService: TableCellEventService,
    private readonly translationService: TranslocoService
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

    this.subscriptions.add(
      this.fetchMoreDataOnScroll$.subscribe((currentOffset: number) => this.getNextConnectionsPage(currentOffset))
    );

    this.subscriptions.add(
      this.addButtonClicks$.subscribe(() =>
        this.openConnectionsDialog(ConnectionsAddEditDialogComponent, {
          data: { searchQuery: this.searchConnectionsByTenantWatchQuery },
        })
      )
    );

    this.subscriptions.add(
      this.editButtonClicks$
        .pipe(switchMap((connectionId: string) => this.getConnectionById(connectionId).pipe(take(1))))
        .subscribe((connection: SourceConnectionDTO) =>
          this.openConnectionsDialog(ConnectionsAddEditDialogComponent, {
            data: { connection, searchQuery: this.searchConnectionsByTenantWatchQuery },
          })
        )
    );

    this.subscriptions.add(
      this.deleteButtonClicks$
        .pipe(switchMap((connectionId: string) => this.getConnectionById(connectionId).pipe(take(1))))
        .subscribe((connection: SourceConnectionDTO) =>
          this.openConnectionsDialog(ConnectionsDeleteDialogComponent, {
            data: { connection, searchQuery: this.searchConnectionsByTenantWatchQuery },
            width: '500px',
          })
        )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private searchConnections(tenantId: string, searchTerm: string) {
    const searchParameters = {
      tenantId,
      paginationOffset: 0,
      pageSize: this.pageSize,
      searchTerm: buildSearchTermRegEx(searchTerm),
    };

    if (!this.searchConnectionsByTenantWatchQuery) {
      this.searchConnectionsByTenantWatchQuery = this.searchConnectionsByTenantIdGQL.watch(searchParameters, {
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

  private getNextConnectionsPage(currentOffset: number) {
    this.searchConnectionsByTenantWatchQuery.fetchMore({
      variables: { paginationOffset: currentOffset, pageSize: this.pageSize },
    });
  }

  private getConnectionById(connectionId: string): Observable<SourceConnectionDTO> {
    return this.authService.authStatus$.pipe(
      switchMap((authStatus: IAuthStatus) => {
        if (!this.getConnectionByIdWatchQuery) {
          this.getConnectionByIdWatchQuery = this.getConnectionByIdGQL.watch(
            { tenantId: authStatus.tenantId, connectionId },
            { notifyOnNetworkStatusChange: true }
          );
          return this.getConnectionByIdWatchQuery.valueChanges;
        } else {
          return this.getConnectionByIdWatchQuery.refetch({ tenantId: authStatus.tenantId, connectionId });
        }
      }),
      tap(({ loading }) => this.isLoading$.next(loading)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter((response: any) => response?.data),
      map(({ data }: { data: IGetConnectionByIdGQLResponse }) => data.getSourceConnection),
      map(SourceConnectionDTO.Build)
    );
  }

  private openConnectionsDialog(componentToOpen?: ComponentType<ConnectionDialogComponent>, config?: MatDialogConfig) {
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
