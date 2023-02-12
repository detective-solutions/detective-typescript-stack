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
import {
  GetMaskingByIdGQL,
  IGetMaskingByIdGQLResponse,
  ISearchMaskingsByTenantGQLResponse,
  SearchMaskingsByTenantIdGQL,
} from '../../graphql';
import { IMaskingTableDef, MaskingClickEvent, MaskingDialogComponent } from '../../models';
import {
  ITableCellEvent,
  NavigationEventService,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { MaskingAddEditDialogComponent, MaskingDeleteDialogComponent } from './dialog';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';

import { ComponentType } from '@angular/cdk/portal';
import { MaskingDTO } from '@detective.solutions/frontend/shared/data-access';
import { QueryRef } from 'apollo-angular';
import { buildSearchTermRegEx } from '@detective.solutions/frontend/shared/utils';

@Component({
  selector: 'maskings',
  templateUrl: './maskings.component.html',
  styleUrls: ['./maskings.component.scss'],
})
export class MaskingsComponent implements OnDestroy, OnInit {
  readonly isLoading$ = new Subject<boolean>();
  readonly fetchMoreDataOnScroll$ = new Subject<number>();
  readonly maskings$ = new BehaviorSubject<MaskingDTO[]>([]);
  readonly tableItems$ = this.maskings$.pipe(map((maskings: MaskingDTO[]) => this.transformToTableStructure(maskings)));

  readonly addButtonClicks$ = new Subject<void>();
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

  private searchMaskingsByTenantWatchQuery!: QueryRef<Response>;
  private getMaskingByIdWatchQuery!: QueryRef<Response>;

  private readonly pageSize = 15;
  private readonly subscriptions = new Subscription();
  private readonly dialogDefaultConfig = {
    width: '60%',
    minWidth: '400px',
    autoFocus: false, // Prevent autofocus on dialog button
  };

  constructor(
    private readonly authService: AuthService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly getMaskingByIdGql: GetMaskingByIdGQL,
    private readonly tableCellEventService: TableCellEventService,
    private readonly navigationEventService: NavigationEventService,
    private readonly matDialog: MatDialog,
    private readonly searchMaskingsByTenantIdGql: SearchMaskingsByTenantIdGQL,
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  ngOnInit() {
    this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) => {
      // Fetch initial data
      this.searchMaskings(authStatus.tenantId, '');
      // Listen to search input from navigation
      this.subscriptions.add(
        this.navigationEventService.searchInput$.subscribe((searchTerm: string) =>
          this.searchMaskings(authStatus.tenantId, searchTerm)
        )
      );
    });

    this.subscriptions.add(
      this.fetchMoreDataOnScroll$.subscribe((currentOffset: number) => this.getNextMaskingsPage(currentOffset))
    );

    this.subscriptions.add(
      this.addButtonClicks$.subscribe(() =>
        this.openMaskingDialog(MaskingAddEditDialogComponent, {
          data: { searchQuery: this.searchMaskingsByTenantWatchQuery },
        })
      )
    );

    this.subscriptions.add(
      this.editButtonClicks$
        .pipe(switchMap((maskingId: string) => this.getMaskingById(maskingId).pipe(take(1))))
        .subscribe((masking: MaskingDTO) =>
          this.openMaskingDialog(MaskingAddEditDialogComponent, {
            data: { masking, searchQuery: this.searchMaskingsByTenantWatchQuery },
          })
        )
    );

    this.subscriptions.add(
      this.deleteButtonClicks$
        .pipe(switchMap((maskingId: string) => this.getMaskingById(maskingId).pipe(take(1))))
        .subscribe((masking: MaskingDTO) =>
          this.openMaskingDialog(MaskingDeleteDialogComponent, {
            data: { masking, searchQuery: this.searchMaskingsByTenantWatchQuery },
            width: '500px',
          })
        )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private searchMaskings(tenantId: string, searchTerm: string) {
    const searchParameters = {
      tenantId,
      paginationOffset: 0,
      pageSize: this.pageSize,
      searchTerm: buildSearchTermRegEx(searchTerm),
    };

    if (!this.searchMaskingsByTenantWatchQuery) {
      this.searchMaskingsByTenantWatchQuery = this.searchMaskingsByTenantIdGql.watch(searchParameters, {
        notifyOnNetworkStatusChange: true,
      });
      this.subscriptions.add(
        this.searchMaskingsByTenantWatchQuery.valueChanges
          .pipe(
            tap(({ loading }) => this.isLoading$.next(loading)),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filter((response: any) => response?.data)
          )
          .subscribe(({ data }: { data: ISearchMaskingsByTenantGQLResponse }) => {
            this.maskings$.next(data.queryMasking.map(MaskingDTO.Build));
          })
      );
    } else {
      this.searchMaskingsByTenantWatchQuery.refetch(searchParameters);
    }
  }

  private getNextMaskingsPage(currentOffset: number) {
    this.searchMaskingsByTenantWatchQuery.fetchMore({
      variables: { paginationOffset: currentOffset, pageSize: this.pageSize },
    });
  }

  private getMaskingById(maskingId: string): Observable<MaskingDTO> {
    return this.authService.authStatus$.pipe(
      switchMap((authStatus: IAuthStatus) => {
        if (!this.getMaskingByIdWatchQuery) {
          this.getMaskingByIdWatchQuery = this.getMaskingByIdGql.watch(
            { tenantId: authStatus.tenantId, maskingId },
            { notifyOnNetworkStatusChange: true }
          );
          return this.getMaskingByIdWatchQuery.valueChanges;
        } else {
          return this.getMaskingByIdWatchQuery.refetch({ tenantId: authStatus.tenantId, maskingId });
        }
      }),
      tap(({ loading }) => this.isLoading$.next(loading)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter((response: any) => response?.data),
      map(({ data }: { data: IGetMaskingByIdGQLResponse }) => data.getMasking),
      map(MaskingDTO.Build)
    );
  }

  private openMaskingDialog(componentToOpen?: ComponentType<MaskingDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? MaskingAddEditDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
  }

  private transformToTableStructure(originalMasking: MaskingDTO[]): IMaskingTableDef[] {
    const tempTableItems = [] as IMaskingTableDef[];
    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.maskings.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
        originalMasking.forEach((masking: MaskingDTO) => {
          tempTableItems.push({
            maskingInfo: {
              columnName: '',
              cellData: {
                id: masking.id,
                type: TableCellTypes.MULTI_TABLE_CELL_WITHOUT_THUMBNAIL,
                name: masking.name,
                description: String(masking.description),
              },
            },
            table: {
              columnName: translation['tableNameColumn'],
              cellData: {
                id: masking.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(masking.table.name),
              },
            },
            userGroups: {
              columnName: translation['userGroupsColumn'],
              cellData: {
                id: masking.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(masking.groups?.map((group) => group.name).join(', ')),
              },
            },
            lastUpdatedBy: {
              columnName: translation['lastUpdatedByColumn'],
              cellData: {
                id: masking.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: masking.lastEditorFullName,
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: masking.id,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(masking.lastUpdated),
              },
            },
            actions: {
              columnName: '',
              cellData: {
                id: masking.id,
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
