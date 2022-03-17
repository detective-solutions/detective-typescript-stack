import { AccessState, ITile, TableCellTypes } from '@detective.solutions/frontend/detective-client/ui';
import { BehaviorSubject, Subject, Subscription, filter, tap } from 'rxjs';
import {
  Casefile,
  CasefileEventType,
  EventService,
  ICasefileEvent,
} from '@detective.solutions/frontend/shared/data-access';
import { Component, OnDestroy } from '@angular/core';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { CasefileService } from '../../services/casefile.service';
import { ICasefileTableDef } from '../../interfaces';

@Component({ template: '' })
export class AbstractCasefileListComponent implements OnDestroy {
  readonly showTableView$!: BehaviorSubject<boolean>;
  readonly fetchMoreDataByOffset$ = new Subject<number>();

  protected readonly initialPageOffset = 0;
  protected readonly subscriptions = new Subscription();

  protected readonly casefileAccessRequested$ = this.subscriptions.add(
    this.eventService.tableCellEvents$
      .pipe(
        filter((event: ICasefileEvent) => event.type === CasefileEventType.REQUEST_ACCESS),
        tap((event: ICasefileEvent) => console.log(event))
      )
      .subscribe()
  );

  protected readonly casefileFavorized$ = this.subscriptions.add(
    this.eventService.tableCellEvents$
      .pipe(
        filter((event: ICasefileEvent) => event.type === CasefileEventType.FAVORIZE && event.value !== undefined),
        tap((event: ICasefileEvent) => console.log(event))
      )
      .subscribe()
  );

  constructor(
    protected readonly authService: AuthService,
    protected readonly casefileService: CasefileService,
    protected readonly eventService: EventService
  ) {
    this.showTableView$ = this.eventService.showTableView$;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  protected transformToTileStructure(originalCasefiles: Casefile[]): ITile[] {
    const tempTileItems = [] as ITile[];
    originalCasefiles.forEach((casefile: Casefile) => {
      tempTileItems.push({ id: casefile.id, title: casefile.title, description: casefile?.description });
    });
    return tempTileItems;
  }

  protected transformToTableStructure(originalCasefiles: Casefile[]): ICasefileTableDef[] {
    const tempTableItems = [] as ICasefileTableDef[];
    originalCasefiles.forEach((casefile: Casefile) => {
      tempTableItems.push({
        casefileInfo: {
          columnName: '',
          casefileId: casefile.id,
          cellData: {
            type: TableCellTypes.HTML_TABLE_CELL,
            imageSrc: casefile.imageSrc,
            header: casefile.title,
            description: casefile.description,
          },
        },
        access: {
          columnName: 'Access',
          casefileId: casefile.id,
          cellData: {
            type: TableCellTypes.ACCESS_TABLE_CELL,
            accessState: AccessState.NO_ACCESS,
          },
        },
        owner: {
          columnName: 'Owner',
          casefileId: casefile.id,
          cellData: {
            type: TableCellTypes.TEXT_TABLE_CELL,
            text: casefile.author.fullName,
          },
        },
        starred: {
          columnName: 'Starred',
          casefileId: casefile.id,
          cellData: {
            type: TableCellTypes.FAVORIZED_TABLE_CELL,
            favorized: false,
          },
        },
        views: {
          columnName: 'Views',
          casefileId: casefile.id,
          cellData: {
            type: TableCellTypes.TEXT_TABLE_CELL,
            text: String(casefile.views),
          },
        },
        lastUpdated: {
          columnName: 'Last Updated',
          casefileId: casefile.id,
          cellData: {
            type: TableCellTypes.TEXT_TABLE_CELL,
            text: String(casefile.lastUpdated),
          },
        },
      } as ICasefileTableDef);
    });
    return tempTableItems;
  }
}
