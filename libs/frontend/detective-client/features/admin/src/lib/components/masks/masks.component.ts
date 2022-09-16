/* eslint-disable sort-imports */
import { IGetAllMaskingsResponse, IMaskingTableDef } from '../../models';
import { ITableInput, TableCellTypes } from '@detective.solutions/frontend/detective-client/ui';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription, map, shareReplay, take } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { MaskingsService } from '../../services';
import { IMasking } from '@detective.solutions/shared/data-access';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'masks',
  templateUrl: './masks.component.html',
  styleUrls: ['./masks.component.scss'],
})
export class MasksComponent implements OnDestroy, OnInit {
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
  // private readonly dialogDefaultConfig = {
  //   width: '650px',
  //   minWidth: '400px',
  // };

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly maskingsService: MaskingsService,
    // private readonly tableCellEventService: TableCellEventService,
    // private readonly matDialog: MatDialog,
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  ngOnInit() {
    this.tableItems$ = this.maskingsService.getAllMaskings(this.initialPageOffset, this.pageSize).pipe(
      map((maskings: IGetAllMaskingsResponse) => {
        return {
          tableItems: this.transformToTableStructure(maskings.maskings),
          totalElementsCount: maskings.totalElementsCount,
        };
      })
    );

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataByOffset$.subscribe((pageOffset: number) =>
        this.maskingsService.getAllMaskingsNextPage(pageOffset, this.pageSize)
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private transformToTableStructure(originalMasking: IMasking[]): IMaskingTableDef[] {
    const tempTableItems = [] as IMaskingTableDef[];

    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.masks.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
        originalMasking.forEach((maskings: IMasking) => {
          tempTableItems.push({
            maskingInfo: {
              columnName: '',
              cellData: {
                id: maskings.id,
                type: TableCellTypes.MULTI_TABLE_CELL,
                name: maskings.name,
              },
            },
            table: {
              columnName: translation['table'],
              cellData: {
                id: maskings.id,
                type: TableCellTypes.TEXT_TABLE_CELL,
                text: String(maskings.table.name),
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: maskings.id,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(maskings.lastUpdated),
              },
            },
          } as IMaskingTableDef);
        });
      });
    return tempTableItems;
  }
}
