import {
  AccessState,
  ITableCellEvent,
  ITile,
  NavigationEventService,
  TableCellEventService,
  TableCellEventType,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { BehaviorSubject, Subject, Subscription, filter, tap } from 'rxjs';
import { Component, OnDestroy } from '@angular/core';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { Casefile } from '@detective.solutions/frontend/shared/data-access';
import { CasefileService } from '../../services';
import { ICasefileTableDef } from '../../interfaces';

@Component({ template: '' })
export class BaseCasefileListComponent implements OnDestroy {
  readonly showTableView$!: BehaviorSubject<boolean>;
  readonly fetchMoreDataByOffset$ = new Subject<number>();

  protected readonly initialPageOffset = 0;
  protected readonly subscriptions = new Subscription();

  protected readonly casefileAccessRequested$ = this.subscriptions.add(
    this.tableCellEventService.tableCellEvents$
      .pipe(
        filter((event: ITableCellEvent) => !!event.id && event.type === TableCellEventType.REQUEST_ACCESS),
        tap((event: ITableCellEvent) => console.log(event))
      )
      .subscribe()
  );

  protected readonly casefileFavorized$ = this.subscriptions.add(
    this.tableCellEventService.tableCellEvents$
      .pipe(
        filter((event: ITableCellEvent) => event.type === TableCellEventType.FAVORIZE && event.value !== undefined),
        tap((event: ITableCellEvent) => console.log(event))
      )
      .subscribe()
  );

  constructor(
    protected readonly authService: AuthService,
    protected readonly casefileService: CasefileService,
    protected readonly navigationEventService: NavigationEventService,
    protected readonly tableCellEventService: TableCellEventService
  ) {
    this.showTableView$ = this.navigationEventService.showTableView$;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  protected transformToTileStructure(originalCasefiles: Casefile[]): ITile[] {
    const tempTileItems = [] as ITile[];
    originalCasefiles.forEach((casefile: Casefile) => {
      tempTileItems.push({
        id: casefile.id,
        title: casefile.title,
        targetUrl: Casefile.basePath + casefile.id,
        description: casefile.description,
        thumbnailSrc: casefile.thumbnailSrc,
      });
    });
    return tempTileItems;
  }

  protected transformToTableStructure(originalCasefiles: Casefile[]): ICasefileTableDef[] {
    // TODO: Translate column headers
    const tempTableItems = [] as ICasefileTableDef[];
    originalCasefiles.forEach((casefile: Casefile) => {
      tempTableItems.push({
        casefileInfo: {
          columnName: '',
          cellData: {
            id: casefile.id,
            type: TableCellTypes.MULTI_TABLE_CELL,
            thumbnailSrc: casefile.thumbnailSrc,
            name: casefile.title,
            description: casefile.description,
          },
        },
        access: {
          columnName: 'Access',
          cellData: {
            id: casefile.id,
            type: TableCellTypes.ACCESS_TABLE_CELL,
            targetUrl: Casefile.basePath + casefile.id,
            accessState: AccessState.ACCESS_GRANTED,
          },
        },
        owner: {
          columnName: 'Owner',
          cellData: {
            id: casefile.id,
            type: TableCellTypes.TEXT_TABLE_CELL,
            text: casefile.author.fullName,
          },
        },
        starred: {
          columnName: 'Starred',
          cellData: {
            id: casefile.id,
            type: TableCellTypes.FAVORIZED_TABLE_CELL,
            isFavorized: false,
          },
        },
        views: {
          columnName: 'Views',
          cellData: {
            id: casefile.id,
            type: TableCellTypes.TEXT_TABLE_CELL,
            text: String(casefile.views),
          },
        },
        lastUpdated: {
          columnName: 'Last Updated',
          cellData: {
            id: casefile.id,
            type: TableCellTypes.DATE_TABLE_CELL,
            date: String(casefile.lastUpdated),
          },
        },
      } as ICasefileTableDef);
    });
    return tempTableItems;
  }
}
