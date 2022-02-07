import {
  AccessState,
  ICasefileTableDef,
  ITile,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { BehaviorSubject, Subject, Subscription, filter, tap } from 'rxjs';
import { CasefileEvent, CasefileEventType, EventService } from '@detective.solutions/frontend/shared/data-access';
import { Component, OnDestroy } from '@angular/core';

import { CasefileService } from '../../services/casefile.service';
import { ICasefile } from '@detective.solutions/shared/data-access';

@Component({ template: '' })
export class AbstractCasefileListComponent implements OnDestroy {
  showTableView$!: BehaviorSubject<boolean>;
  readonly tableCellEvents$ = new Subject<CasefileEvent>();

  private readonly subscriptions = new Subscription();

  readonly casefileAccessRequested$ = this.subscriptions.add(
    this.tableCellEvents$
      .pipe(
        filter((event: CasefileEvent) => event.type === CasefileEventType.REQUEST_ACCESS),
        tap((event: CasefileEvent) => console.log(event))
      )
      .subscribe()
  );

  readonly casefileFavorized$ = this.subscriptions.add(
    this.tableCellEvents$
      .pipe(
        filter((event: CasefileEvent) => event.type === CasefileEventType.FAVORIZE && event.value !== undefined),
        tap((event: CasefileEvent) => console.log(event))
      )
      .subscribe()
  );

  constructor(protected casefileService: CasefileService, protected eventService: EventService) {
    this.showTableView$ = this.eventService.showTableView$;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  protected transformToTileStructure(originalCasefiles: ICasefile[]): ITile[] {
    const tempTileItems = [] as ITile[];
    originalCasefiles.forEach((casefile: ICasefile) => {
      tempTileItems.push({ id: casefile._id, title: casefile.title, description: casefile?.description });
    });
    return tempTileItems;
  }

  protected transformToTableStructure(originalCasefiles: ICasefile[]): ICasefileTableDef[] {
    const tempTableItems = [] as ICasefileTableDef[];
    originalCasefiles.forEach((casefile: ICasefile) => {
      tempTableItems.push({
        casefileInfo: {
          columnName: '',
          casefileId: casefile._id,
          cellData: {
            type: TableCellTypes.HTML_TABLE_CELL,
            imageSrc: casefile.imageSrc,
            header: casefile.title,
            description: casefile.description,
          },
        },
        access: {
          columnName: 'Access',
          casefileId: casefile._id,
          cellData: {
            type: TableCellTypes.ACCESS_TABLE_CELL,
            accessState: AccessState.NO_ACCESS,
          },
        },
        owner: {
          columnName: 'Owner',
          casefileId: casefile._id,
          cellData: {
            type: TableCellTypes.TEXT_TABLE_CELL,
            text: casefile.author?.firstname,
          },
        },
        starred: {
          columnName: 'Starred',
          casefileId: casefile._id,
          cellData: {
            type: TableCellTypes.FAVORIZED_TABLE_CELL,
            favorized: false,
          },
        },
        views: {
          columnName: 'Views',
          casefileId: casefile._id,
          cellData: {
            type: TableCellTypes.TEXT_TABLE_CELL,
            text: String(casefile.views),
          },
        },
        lastUpdated: {
          columnName: 'Last Updated',
          casefileId: casefile._id,
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
