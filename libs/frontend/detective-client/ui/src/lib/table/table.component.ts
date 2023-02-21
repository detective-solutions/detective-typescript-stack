import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IAbstractTableDef, IMatColumnDef } from './models';
import { Observable, Subject, map, shareReplay } from 'rxjs';

import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'table-view',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit {
  @Input() tableItems$!: Observable<IAbstractTableDef[]>;
  @Input() isLoading$!: Subject<boolean>;
  @Input() fetchMoreDataOnScroll$!: Subject<number>;

  tableDataSource$!: Observable<MatTableDataSource<IAbstractTableDef>>;

  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  columnDefinitions!: IMatColumnDef[];
  columnIds: string[] = [];

  private alreadyLoadedTableItems = 0;
  private isAllDataLoaded = false;

  constructor(private readonly breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.tableDataSource$ = this.tableItems$.pipe(
      map((tableItems: IAbstractTableDef[]) => {
        this.isAllDataLoaded = this.alreadyLoadedTableItems === tableItems.length;
        this.alreadyLoadedTableItems = tableItems.length;

        this.columnDefinitions = this.createMatColumnDefs(tableItems);
        this.columnIds = this.extractColumnIds(this.columnDefinitions);
        return new MatTableDataSource(tableItems);
      })
    );
  }

  trackColumnById(_index: number, item: IMatColumnDef) {
    return item.id;
  }

  onScroll() {
    if (!this.isAllDataLoaded) {
      this.fetchMoreDataOnScroll$.next(this.alreadyLoadedTableItems);
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
