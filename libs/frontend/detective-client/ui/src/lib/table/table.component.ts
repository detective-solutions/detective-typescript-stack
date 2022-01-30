import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IMatColumnDef, ITableDef } from './interfaces/table.interface';
import { Observable, Subject, Subscription, map, shareReplay, tap } from 'rxjs';

import { CasefileEvent } from '@detective.solutions/frontend/shared/data-access';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'table-view',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit, OnDestroy {
  readonly pageSizeOptions = [10, 25, 100];

  @Input() tableRows$!: Observable<ITableDef[]>;
  @Input() tableCellEvents$!: Subject<CasefileEvent>;

  tableDataSource!: MatTableDataSource<ITableDef>;
  columnDefinitions: IMatColumnDef[] = [];
  columnIds: string[] = [];

  isLoaded = false;
  subscriptions = new Subscription();

  isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Medium, Breakpoints.Small, Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.subscriptions.add(
      this.tableRows$
        .pipe(tap((tableRows: ITableDef[]) => this.transformData(tableRows)))
        .subscribe((tableDef: ITableDef[]) => {
          this.tableDataSource = new MatTableDataSource(tableDef);
          this.tableDataSource.paginator = this.paginator;
          this.tableDataSource.sort = this.sort;
          this.isLoaded = true;
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private transformData(tableItems: ITableDef[]) {
    this.createMatColumnDefs(tableItems);
    this.extractColumnIds();
  }

  // TODO: Use Material Design Types for abstract design (see example on Angular Material page)
  private createMatColumnDefs(tableItems: ITableDef[]) {
    Object.entries(tableItems[0]).forEach(([key, value]) =>
      this.columnDefinitions.push({ id: key, name: value.columnName })
    );
  }

  private extractColumnIds() {
    this.columnIds = this.columnDefinitions.map((columnDefinition: IMatColumnDef) => columnDefinition.id);
  }
}
