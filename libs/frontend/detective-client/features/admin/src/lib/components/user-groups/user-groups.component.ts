import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import { BehaviorSubject, Observable, Subject, Subscription, filter, map, shareReplay, take, tap } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { GroupsAddEditDialogComponent, GroupsDeleteComponent } from './dialog';
import { GroupsClickEvent, GroupsDialogComponent } from '../../models';
import { ISearchUserGroupsByTenantGQLResponse, SearchUserGroupsByTenantGQL } from '../../graphql';
import {
  ITableCellEvent,
  NavigationEventService,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';

import { ComponentType } from '@angular/cdk/portal';
import { IGroupTableDef } from '../../models/groups-table.interface';
import { IUserGroup } from '@detective.solutions/shared/data-access';
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
  readonly deleteButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === GroupsClickEvent.DELETE_GROUP),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );
  readonly editButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === GroupsClickEvent.EDIT_GROUP),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );
  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  private searchUserGroupsByTenantWatchQuery!: QueryRef<Response>;

  private readonly pageSize = 10;
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
      this.editButtonClicks$.subscribe((userGroupId: string) =>
        this.openUserGroupDialog(GroupsAddEditDialogComponent, {
          data: { id: userGroupId },
        })
      )
    );

    this.subscriptions.add(
      this.deleteButtonClicks$.subscribe((userGroupId: string) =>
        this.openUserGroupDialog(GroupsDeleteComponent, {
          data: { id: userGroupId },
          width: '500px',
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

  openUserGroupDialog(componentToOpen?: ComponentType<GroupsDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? GroupsAddEditDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
  }

  private getNextUserGroupsPage(currentOffset: number) {
    this.searchUserGroupsByTenantWatchQuery.fetchMore({
      variables: { paginationOffset: currentOffset, pageSize: this.pageSize },
    });
  }

  private transformToTableStructure(originalMasking: IUserGroup[]): IGroupTableDef[] {
    const tempTableItems = [] as IGroupTableDef[];
    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.groups.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
        originalMasking.forEach((groups: IUserGroup) => {
          tempTableItems.push({
            groupName: {
              columnName: '',
              cellData: {
                id: groups.id,
                type: TableCellTypes.MULTI_TABLE_CELL_WITHOUT_THUMBNAIL,
                name: groups.name,
                description: String(groups.description),
              },
            },
            members: {
              columnName: translation['roleColumn'],
              cellData: {
                id: groups.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(groups.memberCount?.count),
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: groups.id,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(groups.lastUpdated),
              },
            },
            actions: {
              columnName: '',
              cellData: {
                id: groups.id,
                type: TableCellTypes.ICON_BUTTON_TABLE_CELL,
                buttons: [
                  { icon: 'edit', clickEventKey: GroupsClickEvent.EDIT_GROUP },
                  { icon: 'delete', clickEventKey: GroupsClickEvent.DELETE_GROUP },
                ],
              },
            },
          } as IGroupTableDef);
        });
      });
    return tempTableItems;
  }
}
