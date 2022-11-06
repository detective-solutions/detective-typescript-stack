/* eslint-disable sort-imports */
import { ITableInput, TableCellTypes } from '@detective.solutions/frontend/detective-client/ui';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription, map, shareReplay, take } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { IGroupTableDef } from '../../models/groups-table.interface';
import { UsersService } from '../../services';
import { IGetAllUserGroupsResponse } from '../../models/get-all-user-groups-response.interface';
import { IUserGroup } from '@detective.solutions/shared/data-access';

@Component({
  selector: 'groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnDestroy, OnInit {
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
    this.tableItems$ = this.userService.getAllUserGroups(this.initialPageOffset, this.pageSize).pipe(
      map((userGroups: IGetAllUserGroupsResponse) => {
        return {
          tableItems: this.transformToTableStructure(userGroups.userGroups),
          totalElementsCount: userGroups.totalElementsCount,
        };
      })
    );

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataByOffset$.subscribe((pageOffset: number) =>
        this.userService.getAllUserGroupsNextPage(pageOffset, this.pageSize)
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // TODO: add translations when DET-927 is merged
  private transformToTableStructure(originalMasking: IUserGroup[]): IGroupTableDef[] {
    const tempTableItems = [] as IGroupTableDef[];
    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.masks.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
        originalMasking.forEach((groups: IUserGroup) => {
          tempTableItems.push({
            groupName: {
              columnName: '',
              cellData: {
                id: groups.xid,
                type: TableCellTypes.MULTI_TABLE_CELL,
                name: groups.name,
                description: groups.description,
              },
            },
            members: {
              columnName: 'Members', // translation['lastUpdatedColumn'],
              cellData: {
                id: groups.xid,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(groups.members?.count),
              },
            },
            lastUpdated: {
              columnName: 'Last Updated By', // translation['lastUpdatedColumn'],
              cellData: {
                id: groups.xid,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(groups.lastUpdated),
              },
            },
            actions: {
              columnName: '',
              cellData: {
                id: groups.xid,
                type: TableCellTypes.ICON_BUTTON_TABLE_CELL,
                buttons: [
                  { icon: 'edit', clickEventKey: '' }, //ConnectionsClickEvent.EDIT_CONNECTION },
                  { icon: 'delete', clickEventKey: '' }, // ConnectionsClickEvent.DELETE_CONNECTION },
                ],
              },
            },
          } as IGroupTableDef);
        });
      });
    return tempTableItems;
  }
}
