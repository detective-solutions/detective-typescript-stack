import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IAbstractTableDef, IMatColumnDef, ITableInput } from './interfaces/table.interface';
import { Observable, Subject, Subscription, map, shareReplay, tap } from 'rxjs';

import { EventService } from '@detective.solutions/frontend/shared/data-access';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'table-view',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit, OnDestroy {
  @Input() tableRows$!: Observable<ITableInput>;
  @Input() pageSize = 10;
  @Input() fetchMoreDataByOffset$!: Subject<number>;

  tableDataSource: MatTableDataSource<IAbstractTableDef> = new MatTableDataSource();
  columnDefinitions: IMatColumnDef[] = [];
  columnIds: string[] = [];
  totalElementsCount = 0;
  isFetchingMoreData = false;

  private currentPageOffset = 0;
  private alreadyLoadedElementsCount = 0;
  private readonly loadingScrollBuffer = 100;
  private readonly subscriptions = new Subscription();

  isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly eventService: EventService,
    private readonly logService: LogService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.tableRows$
        .pipe(
          tap(() => {
            if (this.isFetchingMoreData) {
              this.isFetchingMoreData = false;
            }
          })
        )
        .subscribe((tableInput: ITableInput) => {
          this.columnDefinitions = this.createMatColumnDefs(tableInput.tableItems);
          this.columnIds = this.extractColumnIds(this.columnDefinitions);
          this.totalElementsCount = tableInput.totalElementsCount;
          this.alreadyLoadedElementsCount += tableInput.tableItems.length;
          this.tableDataSource = new MatTableDataSource(tableInput.tableItems);
        })
    );

    // Handle resetting of fetching state flag in case of an error
    this.subscriptions.add(
      this.eventService.resetLoadingStates$.subscribe(() => {
        this.isFetchingMoreData = false;
        this.logService.debug('Resetting loading indicator due to error');
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onScroll(e: Event) {
    const currentScrollLocation = (e.target as HTMLElement).scrollTop;
    const limit =
      (e.target as HTMLElement).scrollHeight - (e.target as HTMLElement).offsetHeight - this.loadingScrollBuffer;

    // If the user has scrolled between the bottom and the loadingScrollBuffer range, add more data
    if (currentScrollLocation > limit) {
      this.currentPageOffset += this.pageSize;
      // Check if all available data was already fetched
      if (this.alreadyLoadedElementsCount < this.totalElementsCount) {
        this.fetchMoreDataByOffset$.next(this.currentPageOffset);
        this.isFetchingMoreData = true;
      }
    }
  }

  private createMatColumnDefs(tableItems: IAbstractTableDef[]): IMatColumnDef[] {
    if (!tableItems || tableItems.length === 0) {
      return [];
    }
    const tempMatColumnDefs = [] as IMatColumnDef[];
    Object.entries(tableItems[0]).forEach(([key, value]) =>
      tempMatColumnDefs.push({ id: key, name: value.columnName })
    );
    return tempMatColumnDefs;
  }

  private extractColumnIds(columnDefinitions: IMatColumnDef[]) {
    return columnDefinitions.map((columnDefinition: IMatColumnDef) => columnDefinition.id);
  }
}
