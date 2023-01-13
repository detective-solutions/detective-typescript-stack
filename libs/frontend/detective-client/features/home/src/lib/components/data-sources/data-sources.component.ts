import {
  AccessState,
  IAbstractTableDef,
  ITableCellEvent,
  TableCellEventService,
  TableCellTypes,
} from '@detective.solutions/frontend/detective-client/ui';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { IDataSourceTableDef, IGetAllDataSourcesResponse } from '../../interfaces';
import { Observable, Subject, Subscription, map, take, tap } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';

import { DataSourceService } from '../../services';
import { ISourceConnection } from '@detective.solutions/shared/data-access';

@Component({
  selector: 'data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit, OnDestroy {
  readonly fetchMoreDataOnScroll$ = new Subject<number>();
  readonly isLoading$ = new Subject<boolean>();
  dataSources$!: Observable<IGetAllDataSourcesResponse>;
  tableItems$!: Observable<IAbstractTableDef[]>;
  totalElementsCount$!: Observable<number>;

  readonly pageSize = 10;

  private readonly initialPageOffset = 0;
  private readonly subscriptions = new Subscription();

  readonly accessRequests$ = this.tableCellEventService.accessRequests$.pipe(
    tap((event: ITableCellEvent) => console.log(event))
  );

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly tableCellEventService: TableCellEventService,
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  ngOnInit() {
    this.dataSources$ = this.dataSourceService.getAllDataSources(this.initialPageOffset, this.pageSize);

    this.tableItems$ = this.dataSources$.pipe(
      map((dataSources: IGetAllDataSourcesResponse) => this.transformToTableStructure(dataSources.dataSources))
    );

    // Handle fetching of more data from the corresponding service
    this.subscriptions.add(
      this.fetchMoreDataOnScroll$.subscribe(() =>
        // TODO: Use correct function here
        this.dataSourceService.getAllDataSourcesNextPage(0, this.pageSize)
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private transformToTableStructure(originalDataSources: ISourceConnection[]): IDataSourceTableDef[] {
    const tempTableItems = [] as IDataSourceTableDef[];

    this.translationService
      .selectTranslateObject(`${this.translationScope.scope}.dataSourcesList.columnNames`)
      .pipe(take(1))
      .subscribe((translation: { [key: string]: string }) => {
        originalDataSources.forEach((dataSource: ISourceConnection) => {
          tempTableItems.push({
            dataSourceInfo: {
              columnName: '',
              cellData: {
                id: dataSource.xid,
                type: TableCellTypes.MULTI_TABLE_CELL,
                thumbnail: dataSource.iconSrc,
                name: dataSource.name,
                description: dataSource.description,
              },
            },
            access: {
              columnName: translation['accessColumn'],
              cellData: {
                id: dataSource.xid,
                type: TableCellTypes.ACCESS_TABLE_CELL,
                accessState: AccessState.NO_ACCESS,
              },
            },
            lastUpdated: {
              columnName: translation['lastUpdatedColumn'],
              cellData: {
                id: dataSource.xid,
                type: TableCellTypes.DATE_TABLE_CELL,
                date: String(dataSource.lastUpdated),
              },
            },
          } as IDataSourceTableDef);
        });
      });
    return tempTableItems;
  }
}
