import {
  AccessState,
  ITableCellEvent,
  ITile,
  NavigationEventService,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  combineLatest,
  filter,
  map,
  shareReplay,
  take,
  tap,
} from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ISearchCasefilesByTenantGQLResponse, SearchCasefilesByTenantGQL } from '../../graphql';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';

import { CasefileCreateDialogComponent } from './dialog';
import { CasefileDTO } from '@detective.solutions/frontend/shared/data-access';
import { ComponentType } from '@angular/cdk/portal';
import { ICasefileTableDef } from '../../interfaces';
import { QueryRef } from 'apollo-angular';
import { buildSearchTermRegEx } from '@detective.solutions/frontend/shared/utils';

@Component({ template: '' })
export class BaseCasefileListComponent implements OnInit, OnDestroy {
  readonly isLoading$ = new Subject<boolean>();
  readonly showTableView$!: Subject<boolean>;
  readonly fetchMoreDataOnScroll$ = new Subject<number>();
  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  readonly casefiles$ = new BehaviorSubject<CasefileDTO[]>([]);
  readonly tileItems$ = this.casefiles$.pipe(
    map((casefiles: CasefileDTO[]) => this.transformToTileStructure(casefiles))
  );
  readonly tableItems$ = this.casefiles$.pipe(
    map((casefiles: CasefileDTO[]) => this.transformToTableStructure(casefiles))
  );

  protected readonly accessRequests$ = this.tableCellEventService.accessRequests$.pipe(
    tap((event: ITableCellEvent) => console.log(event))
  );
  protected readonly favorized$ = this.tableCellEventService.favorized$.pipe(
    tap((event: ITableCellEvent) => console.log(event))
  );

  protected readonly subscriptions = new Subscription();

  private searchCasefilesByTenantWatchQuery!: QueryRef<Response>;

  private readonly pageSize = 15;
  private readonly dialogDefaultConfig = {
    width: '650px',
    minWidth: '400px',
  };

  constructor(
    protected readonly authService: AuthService,
    protected readonly breakpointObserver: BreakpointObserver,
    protected readonly matDialog: MatDialog,
    protected readonly navigationEventService: NavigationEventService,
    protected readonly tableCellEventService: TableCellEventService,
    protected readonly translationService: TranslocoService,
    protected readonly searchCasefilesByTenantGQL: SearchCasefilesByTenantGQL,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {
    this.showTableView$ = this.navigationEventService.showTableView$;
  }

  ngOnInit() {
    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataOnScroll$.subscribe((currentOffset: number) => this.getNextCasefilesPage(currentOffset))
    );
    this.customOnInit();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  searchCasefiles(tenantId: string, searchTerm: string, authorId?: string) {
    const searchParameters = {
      tenantId: tenantId,
      paginationOffset: 0,
      pageSize: this.pageSize,
      filterByCurrentUser: !!authorId,
      searchTerm: buildSearchTermRegEx(searchTerm),
      authorId: authorId ?? undefined,
    };

    if (!this.searchCasefilesByTenantWatchQuery) {
      this.searchCasefilesByTenantWatchQuery = this.searchCasefilesByTenantGQL.watch(searchParameters, {
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-and-network',
      });
      this.subscriptions.add(
        this.searchCasefilesByTenantWatchQuery.valueChanges
          .pipe(
            tap(({ loading }) => this.isLoading$.next(loading)),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filter((response: any) => response?.data),
            map(({ data }: { data: ISearchCasefilesByTenantGQLResponse }) => data.queryCasefile.map(CasefileDTO.Build))
          )
          .subscribe((casefiles: CasefileDTO[]) => this.casefiles$.next(casefiles))
      );
    } else {
      this.searchCasefilesByTenantWatchQuery.refetch(searchParameters);
    }
  }

  openNewCasefileDialog(componentToOpen?: ComponentType<CasefileCreateDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? CasefileCreateDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
  }

  protected transformToTileStructure(originalCasefiles: CasefileDTO[]): ITile[] {
    const tempTileItems = [] as ITile[];

    this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) => {
      originalCasefiles.forEach((casefile: CasefileDTO) => {
        tempTileItems.push({
          id: casefile.xid,
          title: casefile.title,
          targetUrl: this.buildCasefileUrl(authStatus.tenantId, casefile.xid),
          description: casefile.description,
          thumbnail: casefile.thumbnail || 'assets/images/detective-logo.svg',
        });
      });
    });
    return tempTileItems;
  }

  protected transformToTableStructure(originalCasefiles: CasefileDTO[]): ICasefileTableDef[] {
    const tempTableItems = [] as ICasefileTableDef[];

    combineLatest([
      this.translationService.selectTranslateObject(`${this.translationScope.scope}.casefileList.columnNames`),
      this.authService.authStatus$,
    ])
      .pipe(take(1))
      .subscribe(([translation, authStatus]) => {
        originalCasefiles.forEach((casefile: CasefileDTO) => {
          tempTableItems.push({
            casefileInfo: {
              columnName: '',
              cellData: {
                id: casefile.xid,
                type: TableCellTypes.MULTI_TABLE_CELL,
                thumbnail: casefile.thumbnail || 'assets/images/detective-logo.svg',
                name: casefile.title,
                description: casefile.description,
              },
            },
            access: {
              columnName: translation['accessColumn'],
              cellData: {
                id: casefile.xid,
                type: TableCellTypes.ACCESS_TABLE_CELL,
                targetUrl: this.buildCasefileUrl(authStatus.tenantId, casefile.xid),
                accessState: AccessState.ACCESS_GRANTED,
              },
            },
            owner: {
              columnName: translation['ownerColumn'],
              cellData: {
                id: casefile.xid,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: casefile.author.fullName,
              },
            },
            starred: {
              columnName: '',
              cellData: {
                id: casefile.xid,
                type: TableCellTypes.FAVORIZED_TABLE_CELL,
                isFavorized: false,
              },
            },
            views: {
              columnName: translation['viewsColumn'],
              cellData: {
                id: casefile.xid,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(casefile.views),
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: casefile.xid,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(casefile.lastUpdated),
              },
            },
          } as ICasefileTableDef);
        });
      });
    return tempTableItems;
  }

  private getNextCasefilesPage(currentOffset: number) {
    this.searchCasefilesByTenantWatchQuery.fetchMore({
      variables: { paginationOffset: currentOffset, pageSize: this.pageSize },
    });
  }

  private buildCasefileUrl(tenantId: string, casefileId: string): string {
    return `tenant/${tenantId}/casefile/${casefileId}`;
  }

  // Can be used by child classes to add custom logic to the ngOnInit hook
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected customOnInit() {}
}
