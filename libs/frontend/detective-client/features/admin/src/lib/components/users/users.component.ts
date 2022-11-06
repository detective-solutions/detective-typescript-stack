/* eslint-disable sort-imports */
import { ITableInput, TableCellTypes } from '@detective.solutions/frontend/detective-client/ui';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription, map, shareReplay, take } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UsersService } from '../../services';
import { IUser } from '@detective.solutions/shared/data-access';
import { IGetAllUsersResponse, IUserTableDef } from '../../models';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnDestroy, OnInit {
  readonly pageSize = 10;
  readonly fetchMoreDataByOffset$ = new Subject<number>();

  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  tableItems$!: Observable<ITableInput>;
  totalElementsCount$!: Observable<number>;

  private readonly subscriptions = new Subscription();
  private readonly initialPageOffset = 0;

  // TODO: use again when masking modal is configured
  // private readonly dialogDefaultConfig = {
  //   width: '650px',
  //   minWidth: '400px',
  // };

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly userService: UsersService,
    // TODO: use again when masking modal is configured
    // private readonly tableCellEventService: TableCellEventService,
    // private readonly matDialog: MatDialog,
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
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // TODO: add translations when DET-927 is merged
  private transformToTableStructure(originalMasking: IUser[]): IUserTableDef[] {
    const tempTableItems = [] as IUserTableDef[];
    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.masks.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
        originalMasking.forEach((user: IUser) => {
          tempTableItems.push({
            userName: {
              columnName: '',
              cellData: {
                id: user.id,
                type: TableCellTypes.MULTI_TABLE_CELL,
                name: String(user.firstname) + ' ' + String(user.lastname),
                description: user.email,
                thumbnail: user.avatarUrl ?? 'assets/images/mocks/avatars/no-image.png',
              },
            },
            role: {
              columnName: 'Role', // translation['lastUpdatedColumn'],
              cellData: {
                id: user.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(user.role),
              },
            },
            lastUpdated: {
              columnName: 'Last Updated', // translation['lastUpdatedColumn'],
              cellData: {
                id: user.id,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(user.lastUpdated ?? '2022-01-01'),
              },
            },
            actions: {
              columnName: '',
              cellData: {
                id: user.id,
                type: TableCellTypes.ICON_BUTTON_TABLE_CELL,
                buttons: [
                  { icon: 'edit', clickEventKey: '' }, //ConnectionsClickEvent.EDIT_CONNECTION },
                  { icon: 'delete', clickEventKey: '' }, // ConnectionsClickEvent.DELETE_CONNECTION },
                ],
              },
            },
          } as IUserTableDef);
        });
      });
    return tempTableItems;
  }
}
