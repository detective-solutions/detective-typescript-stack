import { AccessState, ITableInput, TableCellTypes } from '@detective.solutions/frontend/detective-client/ui';
import { CasefileEventType, EventService, ICasefileEvent } from '@detective.solutions/frontend/shared/data-access';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription, filter, map, tap } from 'rxjs';

import { DataSourceService } from '../../services/data-source.service';
import { IDataSource } from '@detective.solutions/shared/data-access';
import { IDataSourceTableDef } from '../../interfaces';
import { IGetAllDataSourcesResponse } from '../../interfaces/get-all-data-sources-response.interface';

@Component({
  selector: 'data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit, OnDestroy {
  readonly fetchMoreDataByOffset$ = new Subject<number>();

  dataSources$!: Observable<IGetAllDataSourcesResponse>;
  tableItems$!: Observable<ITableInput>;
  totalElementsCount$!: Observable<number>;

  readonly pageSize = 10;

  private readonly initialPageOffset = 0;
  private readonly subscriptions = new Subscription();

  readonly accessRequested$ = this.subscriptions.add(
    this.eventService.tableCellEvents$
      .pipe(
        filter((event: ICasefileEvent) => event.type === CasefileEventType.REQUEST_ACCESS && event.value !== undefined),
        tap((event: ICasefileEvent) => console.log(event))
      )
      .subscribe()
  );

  constructor(private readonly dataSourceService: DataSourceService, private readonly eventService: EventService) {}

  ngOnInit() {
    this.dataSources$ = this.dataSourceService.getAllDataSources(this.initialPageOffset, this.pageSize);

    this.tableItems$ = this.dataSources$.pipe(
      map((dataSources: IGetAllDataSourcesResponse) => {
        return {
          tableItems: this.transformToTableStructure(dataSources.dataSources),
          totalElementsCount: dataSources.totalElementsCount,
        };
      })
    );

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataByOffset$.subscribe((pageOffset: number) =>
        this.dataSourceService.getAllDataSourcesNextPage(pageOffset, this.pageSize)
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private transformToTableStructure(originalDataSources: IDataSource[]): IDataSourceTableDef[] {
    const tempTableItems = [] as IDataSourceTableDef[];
    originalDataSources.forEach((dataSource: IDataSource) => {
      tempTableItems.push({
        dataSourceInfo: {
          columnName: '',
          dataSourceId: dataSource.id,
          cellData: {
            type: TableCellTypes.MULTI_TABLE_CELL,
            thumbnailSrc: dataSource.iconSrc,
            name: dataSource.name,
            description: dataSource.description,
          },
        },
        access: {
          columnName: 'Access',
          dataSourceId: dataSource.id,
          cellData: {
            type: TableCellTypes.ACCESS_TABLE_CELL,
            accessState: AccessState.NO_ACCESS,
          },
        },
        lastUpdated: {
          columnName: 'Last Updated',
          dataSourceId: dataSource.id,
          cellData: {
            type: TableCellTypes.DATE_TABLE_CELL,
            date: String(dataSource.lastUpdated),
          },
        },
      } as IDataSourceTableDef);
    });
    return tempTableItems;
  }
}
