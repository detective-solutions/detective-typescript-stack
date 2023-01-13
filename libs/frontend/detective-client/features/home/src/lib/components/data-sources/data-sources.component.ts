import {
  AccessState,
  ITableCellEvent,
  NavigationEventService,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import { BehaviorSubject, Subject, Subscription, filter, map, take, tap } from 'rxjs';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ISearchDataSourcesByTenantGQLResponse, SearchDataSourcesByTenantGQL } from '../../graphql';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';

import { IDataSourceTableDef } from '../../interfaces';
import { ISourceConnection } from '@detective.solutions/shared/data-access';
import { QueryRef } from 'apollo-angular';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';
import { buildSearchTermRegEx } from '@detective.solutions/frontend/shared/utils';

@Component({
  selector: 'data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit, OnDestroy {
  readonly isLoading$ = new Subject<boolean>();
  readonly fetchMoreDataOnScroll$ = new Subject<number>();
  readonly dataSources$ = new BehaviorSubject<SourceConnectionDTO[]>([]);
  readonly tableItems$ = this.dataSources$.pipe(
    map((dataSources: SourceConnectionDTO[]) => this.transformToTableStructure(dataSources))
  );
  readonly accessRequests$ = this.tableCellEventService.accessRequests$.pipe(
    tap((event: ITableCellEvent) => console.log(event))
  );

  private searchDataSourcesByTenantWatchQuery!: QueryRef<Response>;

  private readonly pageSize = 15;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly navigationEventService: NavigationEventService,
    private readonly searchDataSourcesByTenantGQL: SearchDataSourcesByTenantGQL,
    private readonly tableCellEventService: TableCellEventService,
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  ngOnInit() {
    this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) => {
      // Fetch initial data
      this.searchDataSources(authStatus.tenantId, '');
      // Listen to search input from navigation
      this.subscriptions.add(
        this.navigationEventService.searchInput$.subscribe((searchTerm: string) =>
          this.searchDataSources(authStatus.tenantId, searchTerm)
        )
      );
    });
    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataOnScroll$.subscribe((currentOffset: number) => this.getNextDataSourcesPage(currentOffset))
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  searchDataSources(tenantId: string, searchTerm: string) {
    const searchParameters = {
      tenantId: tenantId,
      paginationOffset: 0,
      pageSize: this.pageSize,
      searchTerm: buildSearchTermRegEx(searchTerm),
    };

    if (!this.searchDataSourcesByTenantWatchQuery) {
      this.searchDataSourcesByTenantWatchQuery = this.searchDataSourcesByTenantGQL.watch(searchParameters, {
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-and-network',
      });
      this.subscriptions.add(
        this.searchDataSourcesByTenantWatchQuery.valueChanges
          .pipe(
            tap(({ loading }) => this.isLoading$.next(loading)),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filter((response: any) => response?.data),
            map(({ data }: { data: ISearchDataSourcesByTenantGQLResponse }) =>
              data.querySourceConnection.map(SourceConnectionDTO.Build)
            )
          )
          .subscribe((dataSources: SourceConnectionDTO[]) => this.dataSources$.next(dataSources))
      );
    } else {
      this.searchDataSourcesByTenantWatchQuery.refetch(searchParameters);
    }
  }

  private getNextDataSourcesPage(currentOffset: number) {
    this.searchDataSourcesByTenantWatchQuery.fetchMore({
      variables: { paginationOffset: currentOffset, pageSize: this.pageSize },
    });
  }

  private transformToTableStructure(originalDataSources: ISourceConnection[]): IDataSourceTableDef[] {
    const tempTableItems = [] as IDataSourceTableDef[];

    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.dataSourcesList.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
        originalDataSources.forEach((dataSource: ISourceConnection) => {
          tempTableItems.push({
            dataSourceInfo: {
              columnName: '',
              cellData: {
                id: dataSource.xid,
                type: TableCellTypes.MULTI_TABLE_CELL,
                thumbnail: dataSource.iconSrc,
                name: dataSource.name,
                description: dataSource.description,
              },
            },
            access: {
              columnName: translation['accessColumn'],
              cellData: {
                id: dataSource.xid,
                type: TableCellTypes.ACCESS_TABLE_CELL,
                accessState: AccessState.NO_ACCESS,
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: dataSource.xid,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(dataSource.lastUpdated),
              },
            },
          } as IDataSourceTableDef);
        });
      });
    return tempTableItems;
  }
}
