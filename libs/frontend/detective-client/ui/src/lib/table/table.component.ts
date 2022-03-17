import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EventService, ICasefileEvent } from '@detective.solutions/frontend/shared/data-access';
import { IAbstractTableDef, IMatColumnDef, ITableInput } from './interfaces/table.interface';
import { Observable, Subject, Subscription, map, shareReplay, tap } from 'rxjs';

import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { MatTableDataSource } from '@angular/material/table';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

@Component({
  selector: 'table-view',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit, OnDestroy {
  @Input() tableRows$!: Observable<ITableInput>;
  @Input() pageSize = 10;
  @Input() tableCellEvents$!: Subject<ICasefileEvent>;
  @Input() fetchMoreDataByOffset$!: Subject<number>;

  tableDataSource!: MatTableDataSource<IAbstractTableDef>;
  columnDefinitions: IMatColumnDef[] = [];
  columnIds: string[] = [];
  totalElementsCount = 0;
  initialDataLoaded = false;
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
    private readonly changeDetectorRef: ChangeDetectorRef,
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
          this.transformData(tableInput.tableItems);
          this.tableDataSource = new TableVirtualScrollDataSource(tableInput.tableItems);
          this.alreadyLoadedElementsCount = tableInput.tableItems.length;
          this.totalElementsCount = tableInput.totalElementsCount;
          this.initialDataLoaded = true;
          this.changeDetectorRef.detectChanges();
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

  private transformData(tableItems: IAbstractTableDef[]) {
    if (!this.columnDefinitions.length) {
      this.createMatColumnDefs(tableItems);
    }
    this.extractColumnIds();
  }

  // TODO: Use Material Design Types for abstract design (see example on Angular Material page)
  private createMatColumnDefs(tableItems: IAbstractTableDef[]) {
    Object.entries(tableItems[0]).forEach(([key, value]) =>
      this.columnDefinitions.push({ id: key, name: value.columnName })
    );
  }

  private extractColumnIds() {
    this.columnIds = this.columnDefinitions.map((columnDefinition: IMatColumnDef) => columnDefinition.id);
  }
}
