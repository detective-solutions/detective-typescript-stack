import { AccessState, IDataSourceTableDef, TableCellTypes } from '@detective.solutions/frontend/detective-client/ui';
import { Component, OnInit } from '@angular/core';
import { Observable, Subject, map, tap } from 'rxjs';

import { CasefileEvent } from '@detective.solutions/frontend/shared/data-access';
import { DataSourceService } from '../../services/data-source.service';
import { IDataSource } from '@detective.solutions/shared/data-access';

@Component({
  selector: 'data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit {
  readonly tableCellEvents$ = new Subject<CasefileEvent>();
  dataSources$!: Observable<IDataSource[]>;
  tableItems$!: Observable<IDataSourceTableDef[]>;

  constructor(private dataSourceService: DataSourceService) {}

  ngOnInit() {
    this.dataSources$ = this.dataSourceService.dataSources$;
    this.tableItems$ = this.dataSources$.pipe(
      tap((val) => console.log(val)),
      map((dataSources: IDataSource[]) => this.transformToTableStructure(dataSources))
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
