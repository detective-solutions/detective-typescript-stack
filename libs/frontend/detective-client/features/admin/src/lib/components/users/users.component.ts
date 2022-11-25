import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { IGetAllUsersResponse, IUserTableDef, UsersClickEvent, UsersDialogComponent } from '../../models';
import {
  ITableCellEvent,
  ITableInput,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, Subject, Subscription, combineLatest, filter, map, shareReplay, take } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { SubscriptionService, UsersService } from '../../services';

import { ComponentType } from '@angular/cdk/portal';
import { IUser } from '@detective.solutions/shared/data-access';
import { UserEditDialogComponent } from './dialog/users-edit-dialog.component';
import { UsersDeleteDialogComponent } from './dialog';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnDestroy, OnInit {
  readonly deleteButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === UsersClickEvent.DELETE_USER),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );

  readonly editButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === UsersClickEvent.EDIT_USER),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );

  readonly activeUsers$: Observable<number> = this.subscriptionService
    .getAllUsers()
    .pipe(map((response: IGetAllUsersResponse) => response.totalElementsCount));

  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  readonly fetchMoreDataByOffset$ = new Subject<number>();

  tableItems$!: Observable<ITableInput>;
  totalElementsCount$!: Observable<number>;
  productInfo$!: Observable<{ userLimit: number }>;
  userRatio$!: Observable<number>;

  readonly pageSize = 10;

  private readonly subscriptions = new Subscription();
  private readonly initialPageOffset = 0;
  private readonly dialogDefaultConfig = {
    width: '650px',
    minWidth: '400px',
  };

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly userService: UsersService,
    private readonly subscriptionService: SubscriptionService,
    private readonly tableCellEventService: TableCellEventService,
    private readonly matDialog: MatDialog,
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  ngOnInit() {
    this.tableItems$ = this.userService.getAllUsers(this.initialPageOffset, this.pageSize).pipe(
      map((users: IGetAllUsersResponse) => {
        return {
          tableItems: this.transformToTableStructure(users.users),
          totalElementsCount: users.totalElementsCount,
        };
      })
    );

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataByOffset$.subscribe((pageOffset: number) =>
        this.userService.getAllUsersNextPage(pageOffset, this.pageSize)
      )
    );

    this.subscriptions.add(
      this.deleteButtonClicks$.subscribe((userId: string) =>
        this.openUserDialog(UsersDeleteDialogComponent, {
          data: { id: userId },
          width: '500px',
        })
      )
    );

    this.subscriptions.add(
      this.editButtonClicks$.subscribe((userId: string) =>
        this.openUserDialog(UserEditDialogComponent, {
          data: { id: userId },
          width: '500px',
        })
      )
    );

    this.productInfo$ = this.subscriptionService.getProductDescription().pipe(
      map((product: { userLimit: number }) => {
        return {
          userLimit: product.userLimit || 0,
        };
      })
    );

    this.userRatio$ = combineLatest(
      [this.activeUsers$, this.productInfo$],
      (active: number, limit: { userLimit: number }) => {
        return (active / limit.userLimit) * 100;
      }
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  openUserDialog(componentToOpen?: ComponentType<UsersDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? UserEditDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
    });
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
                name: `${user.firstname ?? ''} ${user.lastname ?? ''}`,
                description: user.email ?? '',
                thumbnail: user.avatarUrl ?? 'assets/images/mocks/avatars/no-image.png',
              },
            },
            role: {
              columnName: translation['roleColumn'],
              cellData: {
                id: user.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: user.role ?? '',
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: user.id,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: user.lastUpdated ?? '2022-01-01',
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
