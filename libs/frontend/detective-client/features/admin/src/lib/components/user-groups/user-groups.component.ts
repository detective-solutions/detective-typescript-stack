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
  GetUserGroupByIdGQL,
  IGetUserGroupByIdGQLResponse,
  ISearchUserGroupsByTenantGQLResponse,
  SearchUserGroupsByTenantGQL,
} from '../../graphql';
import {
  ITableCellEvent,
  NavigationEventService,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { UserGroupsAddEditDialogComponent, UserGroupsDeleteComponent } from './dialog';
import { UserGroupsClickEvent as UserGroupsClickEvent, UserGroupsDialogComponent } from '../../models';

import { ComponentType } from '@angular/cdk/portal';
import { IUserGroup } from '@detective.solutions/shared/data-access';
import { IUserGroupsTableDef } from '../../models/user-groups-table-definition.interface';
import { QueryRef } from 'apollo-angular';
import { UserGroupDTO } from '@detective.solutions/frontend/shared/data-access';
import { buildSearchTermRegEx } from '@detective.solutions/frontend/shared/utils';

@Component({
  selector: 'user-groups',
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.scss'],
})
export class UserGroupsComponent implements OnDestroy, OnInit {
  readonly isLoading$ = new Subject<boolean>();
  readonly fetchMoreDataOnScroll$ = new Subject<number>();
  readonly userGroups$ = new BehaviorSubject<UserGroupDTO[]>([]);
  readonly tableItems$ = this.userGroups$.pipe(
    map((userGroups: UserGroupDTO[]) => this.transformToTableStructure(userGroups))
  );
  readonly addButtonClicks$ = new Subject<void>();
  readonly deleteButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === UserGroupsClickEvent.DELETE_USER_GROUP),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );
  readonly editButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === UserGroupsClickEvent.EDIT_USER_GROUP),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );
  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  private searchUserGroupsByTenantWatchQuery!: QueryRef<Response>;
  private getUserGroupByIdWatchQuery!: QueryRef<Response>;

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
    private readonly getUserGroupByIdGQL: GetUserGroupByIdGQL,
    private readonly matDialog: MatDialog,
    private readonly navigationEventService: NavigationEventService,
    private readonly searchUserGroupsByTenantGQL: SearchUserGroupsByTenantGQL,
    private readonly tableCellEventService: TableCellEventService,
    private readonly translationService: TranslocoService
  ) {}

  ngOnInit() {
    this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) => {
      // Fetch initial data
      this.searchUserGroups(authStatus.tenantId, '');
      // Listen to search input from navigation
      this.subscriptions.add(
        this.navigationEventService.searchInput$.subscribe((searchTerm: string) =>
          this.searchUserGroups(authStatus.tenantId, searchTerm)
        )
      );
    });

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataOnScroll$.subscribe((currentOffset: number) => this.getNextUserGroupsPage(currentOffset))
    );

    this.subscriptions.add(
      this.addButtonClicks$.subscribe(() =>
        this.openUserGroupDialog(UserGroupsAddEditDialogComponent, {
          data: { searchQuery: this.searchUserGroupsByTenantWatchQuery },
        })
      )
    );

    this.subscriptions.add(
      this.editButtonClicks$
        .pipe(switchMap((userGroupId: string) => this.getUserGroupById(userGroupId)))
        .subscribe((userGroup: UserGroupDTO) =>
          this.openUserGroupDialog(UserGroupsAddEditDialogComponent, {
            data: { userGroup, searchQuery: this.searchUserGroupsByTenantWatchQuery },
          })
        )
    );

    this.subscriptions.add(
      this.deleteButtonClicks$
        .pipe(switchMap((userGroupId: string) => this.getUserGroupById(userGroupId)))
        .subscribe((userGroup: UserGroupDTO) =>
          this.openUserGroupDialog(UserGroupsDeleteComponent, {
            data: { userGroup, searchQuery: this.searchUserGroupsByTenantWatchQuery },
          })
        )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  searchUserGroups(tenantId: string, searchTerm: string) {
    const searchParameters = {
      tenantId: tenantId,
      paginationOffset: 0,
      pageSize: this.pageSize,
      searchTerm: buildSearchTermRegEx(searchTerm),
    };

    if (!this.searchUserGroupsByTenantWatchQuery) {
      this.searchUserGroupsByTenantWatchQuery = this.searchUserGroupsByTenantGQL.watch(searchParameters, {
        notifyOnNetworkStatusChange: true,
      });
      this.subscriptions.add(
        this.searchUserGroupsByTenantWatchQuery.valueChanges
          .pipe(
            tap(({ loading }) => this.isLoading$.next(loading)),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filter((response: any) => response?.data)
          )
          .subscribe(({ data }: { data: ISearchUserGroupsByTenantGQLResponse }) => {
            this.userGroups$.next(data.queryUserGroup.map(UserGroupDTO.Build));
          })
      );
    } else {
      this.searchUserGroupsByTenantWatchQuery.refetch(searchParameters);
    }
  }

  openUserGroupDialog(componentToOpen?: ComponentType<UserGroupsDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? UserGroupsAddEditDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
  }

  private getNextUserGroupsPage(currentOffset: number) {
    this.searchUserGroupsByTenantWatchQuery.fetchMore({
      variables: { paginationOffset: currentOffset, pageSize: this.pageSize },
    });
  }

  private getUserGroupById(userGroupId: string): Observable<UserGroupDTO> {
    return this.authService.authStatus$.pipe(
      switchMap((authStatus: IAuthStatus) => {
        if (!this.getUserGroupByIdWatchQuery) {
          this.getUserGroupByIdWatchQuery = this.getUserGroupByIdGQL.watch(
            { tenantId: authStatus.tenantId, userGroupId },
            { notifyOnNetworkStatusChange: true }
          );
          return this.getUserGroupByIdWatchQuery.valueChanges;
        } else {
          return this.getUserGroupByIdWatchQuery.refetch({ tenantId: authStatus.tenantId, userGroupId });
        }
      }),
      tap(({ loading }) => this.isLoading$.next(loading)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter((response: any) => response?.data),
      map(({ data }: { data: IGetUserGroupByIdGQLResponse }) => data.getUserGroup),
      map(UserGroupDTO.Build)
    );
  }

  private transformToTableStructure(userGroups: IUserGroup[]): IUserGroupsTableDef[] {
    const tempTableItems = [] as IUserGroupsTableDef[];
    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.userGroups.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
        userGroups.forEach((userGroup: IUserGroup) => {
          tempTableItems.push({
            groupName: {
              columnName: '',
              cellData: {
                id: userGroup.id,
                type: TableCellTypes.MULTI_TABLE_CELL_WITHOUT_THUMBNAIL,
                name: userGroup.name,
                description: String(userGroup.description),
              },
            },
            members: {
              columnName: translation['memberCountColumn'],
              cellData: {
                id: userGroup.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(userGroup.memberCount?.count),
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: userGroup.id,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(userGroup.lastUpdated),
              },
            },
            actions: {
              columnName: '',
              cellData: {
                id: userGroup.id,
                type: TableCellTypes.ICON_BUTTON_TABLE_CELL,
                buttons: [
                  { icon: 'edit', clickEventKey: UserGroupsClickEvent.EDIT_USER_GROUP },
                  { icon: 'delete', clickEventKey: UserGroupsClickEvent.DELETE_USER_GROUP },
                ],
              },
            },
          } as IUserGroupsTableDef);
        });
      });
    return tempTableItems;
  }
}
