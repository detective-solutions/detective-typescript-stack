import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { GroupsAddEditDialogComponent, GroupsDeleteComponent } from './dialog';
import { GroupsClickEvent, GroupsDialogComponent } from '../../models';
import {
  IAbstractTableDef,
  ITableCellEvent,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, Subject, Subscription, filter, map, shareReplay, take } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';

import { ComponentType } from '@angular/cdk/portal';
import { IGetAllUserGroupsResponse } from '../../models/get-all-user-groups-response.interface';
import { IGroupTableDef } from '../../models/groups-table.interface';
import { IUserGroup } from '@detective.solutions/shared/data-access';
import { UsersService } from '../../services';

@Component({
  selector: 'groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnDestroy, OnInit {
  readonly pageSize = 10;
  readonly fetchMoreDataOnScroll$ = new Subject<number>();

  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  tableItems$!: Observable<IAbstractTableDef[]>;
  totalElementsCount$!: Observable<number>;

  private readonly subscriptions = new Subscription();
  private readonly initialPageOffset = 0;

  private readonly dialogDefaultConfig = {
    width: '650px',
    minWidth: '400px',
  };

  readonly deleteButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === GroupsClickEvent.DELETE_GROUP),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );

  readonly editButtonClicks$ = this.tableCellEventService.iconButtonClicks$.pipe(
    filter((tableCellEvent: ITableCellEvent) => tableCellEvent.value === GroupsClickEvent.EDIT_GROUP),
    map((tableCellEvent: ITableCellEvent) => tableCellEvent.id)
  );

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly usersService: UsersService,
    private readonly tableCellEventService: TableCellEventService,
    private readonly matDialog: MatDialog,
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  ngOnInit() {
    this.tableItems$ = this.usersService
      .getAllUserGroups(this.initialPageOffset, this.pageSize)
      .pipe(map((userGroups: IGetAllUserGroupsResponse) => this.transformToTableStructure(userGroups.userGroup)));

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataOnScroll$.subscribe(() =>
        // TODO: Use correct function here
        this.usersService.getAllUserGroupsNextPage(0, this.pageSize)
      )
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

  openUserGroupDialog(componentToOpen?: ComponentType<GroupsDialogComponent>, config?: MatDialogConfig) {
    this.matDialog.open(componentToOpen ?? GroupsAddEditDialogComponent, {
      ...this.dialogDefaultConfig,
      ...config,
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
