import {
  AccessState,
  ITableCellEvent,
  ITile,
  NavigationEventService,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import { BehaviorSubject, Subject, Subscription, combineLatest, take, tap } from 'rxjs';
import { Component, Inject, OnDestroy } from '@angular/core';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { Casefile } from '@detective.solutions/frontend/shared/data-access';
import { CasefileService } from '../../services';
import { ICasefileTableDef } from '../../interfaces';

@Component({ template: '' })
export class BaseCasefileListComponent implements OnDestroy {
  readonly showTableView$!: BehaviorSubject<boolean>;
  readonly fetchMoreDataByOffset$ = new Subject<number>();

  protected readonly initialPageOffset = 0;
  protected readonly subscriptions = new Subscription();

  protected readonly accessRequests$ = this.tableCellEventService.accessRequests$.pipe(
    tap((event: ITableCellEvent) => console.log(event))
  );

  protected readonly favorized$ = this.tableCellEventService.favorized$.pipe(
    tap((event: ITableCellEvent) => console.log(event))
  );

  constructor(
    protected readonly authService: AuthService,
    protected readonly casefileService: CasefileService,
    protected readonly navigationEventService: NavigationEventService,
    protected readonly tableCellEventService: TableCellEventService,
    protected readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {
    this.showTableView$ = this.navigationEventService.showTableView$;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  protected transformToTileStructure(originalCasefiles: Casefile[]): ITile[] {
    const tempTileItems = [] as ITile[];

    this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) => {
      originalCasefiles.forEach((casefile: Casefile) => {
        tempTileItems.push({
          id: casefile.id,
          title: casefile.title,
          targetUrl: this.buildCasefileUrl(authStatus.tenantId, casefile.id),
          description: casefile.description,
          thumbnailSrc: casefile.thumbnailSrc,
        });
      });
    });
    return tempTileItems;
  }

  protected transformToTableStructure(originalCasefiles: Casefile[]): ICasefileTableDef[] {
    const tempTableItems = [] as ICasefileTableDef[];

    combineLatest([
      this.translationService.selectTranslateObject(`${this.translationScope.scope}.casefileList.columnNames`),
      this.authService.authStatus$,
    ])
      .pipe(take(1))
      .subscribe(([translation, authStatus]) => {
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
              columnName: translation['accessColumn'],
              cellData: {
                id: casefile.id,
                type: TableCellTypes.ACCESS_TABLE_CELL,
                targetUrl: this.buildCasefileUrl(authStatus.tenantId, casefile.id),
                accessState: AccessState.ACCESS_GRANTED,
              },
            },
            owner: {
              columnName: translation['ownerColumn'],
              cellData: {
                id: casefile.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: casefile.author.fullName,
              },
            },
            starred: {
              columnName: '',
              cellData: {
                id: casefile.id,
                type: TableCellTypes.FAVORIZED_TABLE_CELL,
                isFavorized: false,
              },
            },
            views: {
              columnName: translation['viewsColumn'],
              cellData: {
                id: casefile.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(casefile.views),
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: casefile.id,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(casefile.lastUpdated),
              },
            },
          } as ICasefileTableDef);
        });
      });
    return tempTableItems;
  }

  private buildCasefileUrl(tenantId: string, casefileId: string): string {
    return `tenant/${tenantId}/casefile/${casefileId}`;
  }
}
