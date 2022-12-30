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
  catchError,
  combineLatest,
  map,
  shareReplay,
  take,
  tap,
} from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  GetCasefilesByAuthorGQL,
  IGetCasefilesByAuthorGQLResponse,
  ISearchCasefilesByTenantGQLResponse,
  SearchCasefilesByTenantGQL,
} from '../../graphql';
import { ICasefileTableDef, IGetAllCasefilesResponse } from '../../interfaces';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';

import { CasefileCreateDialogComponent } from './dialog';
import { CasefileDTO } from '@detective.solutions/frontend/shared/data-access';
import { ComponentType } from '@angular/cdk/portal';
import { QueryRef } from 'apollo-angular';
import { transformError } from '@detective.solutions/frontend/shared/error-handling';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({ template: '' })
export class BaseCasefileListComponent implements OnInit, OnDestroy {
  casefiles$ = new Subject<CasefileDTO[]>();
  tileItems$ = this.casefiles$.pipe(
    map((casefiles: CasefileDTO[]) => {
      return {
        tiles: this.transformToTileStructure(casefiles),
        totalElementsCount: this.totalCount,
      };
    })
  );
  tableItems$ = this.casefiles$.pipe(
    map((casefiles: CasefileDTO[]) => {
      return {
        tableItems: this.transformToTableStructure(casefiles),
        totalElementsCount: this.totalCount,
      };
    })
  );

  readonly showTableView$!: BehaviorSubject<boolean>;
  readonly fetchMoreDataByOffset$ = new Subject<number>();
  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  protected readonly initialPageOffset = 0;
  protected readonly pageSize = 10;
  protected readonly subscriptions = new Subscription();
  protected totalCount!: number;

  protected readonly accessRequests$ = this.tableCellEventService.accessRequests$.pipe(
    tap((event: ITableCellEvent) => console.log(event))
  );
  protected readonly favorized$ = this.tableCellEventService.favorized$.pipe(
    tap((event: ITableCellEvent) => console.log(event))
  );

  private searchCasefilesByTenantWatchQuery!: QueryRef<Response>;
  private getCasefilesByAuthorWatchQuery!: QueryRef<Response>;

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
    private readonly getCasefilesByAuthorGQL: GetCasefilesByAuthorGQL,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {
    this.showTableView$ = this.navigationEventService.showTableView$;
  }

  ngOnInit() {
    this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) => {
      this.searchCasefiles(authStatus.tenantId, ''); // Make initial request

      // Listen to search input from navigation
      this.subscriptions.add(
        this.navigationEventService.searchInput$.subscribe((searchTerm: string) =>
          this.searchCasefiles(authStatus.tenantId, searchTerm)
        )
      );

      // Handle fetching of more data from the corresponding service
      this.subscriptions.add(
        this.fetchMoreDataByOffset$.subscribe((pageOffset: number) =>
          this.getNextCasefilePage(pageOffset, this.pageSize)
        )
      );

      // Handle fetching of more data from the corresponding service
      this.subscriptions.add(
        this.fetchMoreDataByOffset$.subscribe((pageOffset: number) =>
          this.getCasefilesByAuthorNextPage(pageOffset, this.pageSize)
        )
      );

      this.customOnInit();
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  searchCasefiles(tenantId: string, searchTerm: string) {
    const searchParameters = {
      tenantId: tenantId,
      paginationOffset: this.initialPageOffset,
      pageSize: this.pageSize,
      searchTerm: this.buildSearchTermRegEx(searchTerm),
    };

    if (!this.searchCasefilesByTenantWatchQuery) {
      this.searchCasefilesByTenantWatchQuery = this.searchCasefilesByTenantGQL.watch(searchParameters);
      this.subscriptions.add(
        this.searchCasefilesByTenantWatchQuery.valueChanges
          .pipe(
            map((response: any) => response.data),
            tap((response: ISearchCasefilesByTenantGQLResponse) => {
              this.totalCount = response.aggregateCasefile.count;
            }),
            map((response: ISearchCasefilesByTenantGQLResponse) => response.queryCasefile.map(CasefileDTO.Build))
          )
          .subscribe((casefiles: CasefileDTO[]) => {
            this.casefiles$.next(casefiles);
          })
      );
    } else {
      this.searchCasefilesByTenantWatchQuery.refetch(searchParameters);
    }
  }

  getNextCasefilePage(paginationOffset: number, pageSize: number) {
    this.searchCasefilesByTenantWatchQuery
      .fetchMore({
        variables: { paginationOffset: paginationOffset, pageSize: pageSize },
      })
      .catch((error) => this.handleError(error));
  }

  getCasefilesByAuthor(
    paginationOffset: number,
    pageSize: number,
    userId: string
  ): Observable<IGetAllCasefilesResponse> {
    this.getCasefilesByAuthorWatchQuery = this.getCasefilesByAuthorGQL.watch({
      paginationOffset: paginationOffset,
      pageSize: pageSize,
      userId: userId,
    });
    return this.getCasefilesByAuthorWatchQuery.valueChanges.pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((response: any) => response.data),
      map((response: IGetCasefilesByAuthorGQLResponse) => {
        if (!response.queryCasefile || !response.aggregateCasefile) {
          this.handleError('Database response is missing required key');
        }
        return {
          casefiles: response.queryCasefile,
          totalElementsCount: response.aggregateCasefile.count,
        };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getCasefilesByAuthorNextPage(paginationOffset: number, pageSize: number) {
    this.getCasefilesByAuthorWatchQuery
      .fetchMore({
        variables: { paginationOffset: paginationOffset, pageSize: pageSize },
      })
      .catch((error) => this.handleError(error));
  }

  private handleError(error: string) {
    this.tableCellEventService.resetLoadingStates$.next(true);
    return transformError(error);
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
          id: casefile.id,
          title: casefile.title,
          targetUrl: this.buildCasefileUrl(authStatus.tenantId, casefile.id),
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
                id: casefile.id,
                type: TableCellTypes.MULTI_TABLE_CELL,
                thumbnail: casefile.thumbnail || 'assets/images/detective-logo.svg',
                name: casefile.title,
                description: casefile.description,
              },
            },
            access: {
              columnName: translation['accessColumn'],
              cellData: {
                id: casefile.id,
                type: TableCellTypes.ACCESS_TABLE_CELL,
                targetUrl: this.buildCasefileUrl(authStatus.tenantId, casefile.id),
                accessState: AccessState.ACCESS_GRANTED,
              },
            },
            owner: {
              columnName: translation['ownerColumn'],
              cellData: {
                id: casefile.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: casefile.author.fullName,
              },
            },
            starred: {
              columnName: '',
              cellData: {
                id: casefile.id,
                type: TableCellTypes.FAVORIZED_TABLE_CELL,
                isFavorized: false,
              },
            },
            views: {
              columnName: translation['viewsColumn'],
              cellData: {
                id: casefile.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(casefile.views),
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: casefile.id,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(casefile.lastUpdated),
              },
            },
          } as ICasefileTableDef);
        });
      });
    return tempTableItems;
  }

  private buildCasefileUrl(tenantId: string, casefileId: string): string {
    return `tenant/${tenantId}/casefile/${casefileId}`;
  }

  private buildSearchTermRegEx(searchTerm: string) {
    return searchTerm ? `/.*${searchTerm}.*/i` : '/.*/i';
  }

  // Can be used by child classes to add custom logic to the ngOnInit hook
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected customOnInit() {}
}
