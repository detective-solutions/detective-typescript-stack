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
  switchMap,
  take,
  tap,
} from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  GetUserByIdGQL,
  IGetUserByIdGQLResponse,
  ISearchUsersByTenantGQLResponse,
  SearchUsersByTenantGQL,
} from '../../graphql';
import {
  ITableCellEvent,
  NavigationEventService,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { IUserTableDef, UsersClickEvent, UsersDialogComponent } from '../../models';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';

import { ComponentType } from '@angular/cdk/portal';
import { IUser } from '@detective.solutions/shared/data-access';
import { QueryRef } from 'apollo-angular';
import { SubscriptionService } from '../../services';
import { UserDTO } from '@detective.solutions/frontend/shared/data-access';
import { UserEditDialogComponent } from './dialog/users-edit-dialog.component';
import { UsersDeleteDialogComponent } from './dialog';
import { buildSearchTermRegEx } from '@detective.solutions/frontend/shared/utils';
import { capitalize } from '@detective.solutions/shared/utils';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnDestroy, OnInit {
  readonly isLoading$ = new Subject<boolean>();
  readonly fetchMoreDataOnScroll$ = new Subject<number>();
  readonly users$ = new BehaviorSubject<UserDTO[]>([]);
  readonly currentUsersCount$ = new BehaviorSubject<number>(0);
  readonly usersRatio$ = new BehaviorSubject<number>(0);

  readonly usersInfo$ = combineLatest([this.currentUsersCount$, this.subscriptionService.getProductDescription()]).pipe(
    tap(([currentUsersCount, subscriptionInfo]) => {
      this.usersRatio$.next((currentUsersCount / subscriptionInfo.userLimit) * 100);
    }),
    map(([currentUsersCount, subscriptionInfo]) => {
      return { currentUsersCount, userLimit: subscriptionInfo.userLimit };
    })
  );
  readonly tableItems$ = this.users$.pipe(map((users: UserDTO[]) => this.transformToTableStructure(users)));
  readonly deleteButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === UsersClickEvent.DELETE_USER),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );
  readonly editButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === UsersClickEvent.EDIT_USER),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );
  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  private searchUsersByTenantWatchQuery!: QueryRef<Response>;

  private readonly pageSize = 15;
  private readonly subscriptions = new Subscription();
  private readonly dialogDefaultConfig = {
    width: '400px',
    minWidth: '400px',
    autoFocus: false, // Prevent autofocus on dialog button
  };

  constructor(
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly authService: AuthService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly getUserByIdGQL: GetUserByIdGQL,
    private readonly matDialog: MatDialog,
    private readonly navigationEventService: NavigationEventService,
    private readonly searchUsersByTenantGQL: SearchUsersByTenantGQL,
    private readonly subscriptionService: SubscriptionService,
    private readonly tableCellEventService: TableCellEventService,
    private readonly translationService: TranslocoService
  ) {}

  ngOnInit() {
    this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) => {
      // Fetch initial data
      this.searchUsers(authStatus.tenantId, '');
      // Listen to search input from navigation
      this.subscriptions.add(
        this.navigationEventService.searchInput$.subscribe((searchTerm: string) =>
          this.searchUsers(authStatus.tenantId, searchTerm)
        )
      );
    });

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataOnScroll$.subscribe((currentOffset: number) => this.getNextUsersPage(currentOffset))
    );

    this.subscriptions.add(
      this.editButtonClicks$.pipe(switchMap((userId: string) => this.getUserById(userId))).subscribe((user: IUser) =>
        this.openUserDialog(UserEditDialogComponent, {
          data: { user, searchQuery: this.searchUsersByTenantWatchQuery },
        })
      )
    );

    this.subscriptions.add(
      this.deleteButtonClicks$.pipe(switchMap((userId: string) => this.getUserById(userId))).subscribe((user: IUser) =>
        this.openUserDialog(UsersDeleteDialogComponent, {
          data: { user, searchQuery: this.searchUsersByTenantWatchQuery },
        })
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  searchUsers(tenantId: string, searchTerm: string) {
    const searchParameters = {
      tenantId: tenantId,
      paginationOffset: 0,
      pageSize: this.pageSize,
      searchTerm: buildSearchTermRegEx(searchTerm),
    };

    if (!this.searchUsersByTenantWatchQuery) {
      this.searchUsersByTenantWatchQuery = this.searchUsersByTenantGQL.watch(searchParameters, {
        notifyOnNetworkStatusChange: true,
      });
      this.subscriptions.add(
        this.searchUsersByTenantWatchQuery.valueChanges
          .pipe(
            tap(({ loading }) => this.isLoading$.next(loading)),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filter((response: any) => response?.data)
          )
          .subscribe(({ data }: { data: ISearchUsersByTenantGQLResponse }) => {
            this.users$.next(data.queryUser.map(UserDTO.Build));
            this.currentUsersCount$.next(data.aggregateUser.count);
          })
      );
    } else {
      this.searchUsersByTenantWatchQuery.refetch(searchParameters);
    }
  }

  openUserDialog(componentToOpen?: ComponentType<UsersDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? UserEditDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
  }

  private getNextUsersPage(currentOffset: number) {
    this.searchUsersByTenantWatchQuery.fetchMore({
      variables: { paginationOffset: currentOffset, pageSize: this.pageSize },
    });
  }

  private getUserById(userId: string): Observable<UserDTO> {
    return this.getUserByIdGQL.watch({ id: userId }, { notifyOnNetworkStatusChange: true }).valueChanges.pipe(
      tap(({ loading }) => this.isLoading$.next(loading)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter((response: any) => response?.data),
      map(({ data }: { data: IGetUserByIdGQLResponse }) => data.getUser),
      map(UserDTO.Build)
    );
  }

  private transformToTableStructure(originalUsers: IUser[]): IUserTableDef[] {
    const tempTableItems = [] as IUserTableDef[];
    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.users.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
        originalUsers.forEach((user: IUser) => {
          tempTableItems.push({
            userName: {
              columnName: '',
              cellData: {
                id: user.id,
                type: TableCellTypes.MULTI_TABLE_CELL,
                name: `${user.firstname} ${user.lastname}`,
                description: user.email,
                thumbnail: user.avatarUrl ? user.avatarUrl : 'assets/images/mocks/avatars/no-image.png',
              },
            },
            role: {
              columnName: translation['roleColumn'],
              cellData: {
                id: user.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: capitalize(user.role),
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: user.id,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: user.lastUpdated,
              },
            },
            actions: {
              columnName: '',
              cellData: {
                id: user.id,
                type: TableCellTypes.ICON_BUTTON_TABLE_CELL,
                buttons: [
                  { icon: 'edit', clickEventKey: UsersClickEvent.EDIT_USER },
                  { icon: 'delete', clickEventKey: UsersClickEvent.DELETE_USER },
                ],
              },
            },
          } as IUserTableDef);
        });
      });
    return tempTableItems;
  }
}
