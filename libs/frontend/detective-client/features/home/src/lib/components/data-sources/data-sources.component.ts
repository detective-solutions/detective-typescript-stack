import { AccessState, ITableInput, TableCellTypes } from '@detective.solutions/frontend/detective-client/ui';
import { Component, OnInit } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';

import { DataSourceService } from '../../services/data-source.service';
import { ICasefileEvent } from '@detective.solutions/frontend/shared/data-access';
import { IDataSource } from '@detective.solutions/shared/data-access';
import { IDataSourceTableDef } from '../../interfaces';

@Component({
  selector: 'data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit {
  readonly tableCellEvents$ = new Subject<ICasefileEvent>();
  readonly paginatorEvents$ = new Subject<number>();

  dataSources$!: Observable<IDataSource[]>;
  tableItems$!: Observable<ITableInput>;
  totalElementsCount$!: Observable<number>;

  readonly pageSize = 10;

  private readonly initialPageOffset = 0;

  constructor(private dataSourceService: DataSourceService) {}

  ngOnInit() {
    this.dataSources$ = this.dataSourceService.dataSources$;
    this.tableItems$ = this.dataSources$.pipe(
      map((dataSources: IDataSource[]) => {
        return {
          tableItems: this.transformToTableStructure(dataSources),
          totalElementsCount: 100,
        };
      })
    );
  }

  private transformToTableStructure(originalDataSources: IDataSource[]): IDataSourceTableDef[] {
    const tempTableItems = [] as IDataSourceTableDef[];
    originalDataSources.forEach((dataSource: IDataSource) => {
      tempTableItems.push({
        dataSourceInfo: {
          columnName: '',
          dataSourceId: dataSource._id,
          cellData: {
            type: TableCellTypes.HTML_TABLE_CELL,
            imageSrc: dataSource.thumbnailSrc,
            header: dataSource.name,
            description: dataSource.description,
          },
        },
        access: {
          columnName: 'Access',
          dataSourceId: dataSource._id,
          cellData: {
            type: TableCellTypes.ACCESS_TABLE_CELL,
            accessState: AccessState.NO_ACCESS,
          },
        },
        lastUpdated: {
          columnName: 'Last Updated',
          dataSourceId: dataSource._id,
          cellData: {
            type: TableCellTypes.TEXT_TABLE_CELL,
            text: String(dataSource.lastUpdated),
          },
        },
      } as IDataSourceTableDef);
    });
    return tempTableItems;
  }
}
