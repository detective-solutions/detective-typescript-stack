import { IAbstractTableDef, TableCellData } from '@detective.solutions/frontend/detective-client/ui';

export interface IDataSourceTableDef extends IAbstractTableDef {
  dataSourceInfo: IDataSourceColumnDef;
  access: IDataSourceColumnDef;
  lastUpdated: IDataSourceColumnDef;
}

export interface IDataSourceColumnDef {
  columnName: string;
  dataSourceId: string;
  cellData: TableCellData;
}
