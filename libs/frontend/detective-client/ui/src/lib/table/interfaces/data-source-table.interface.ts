import { ITableCellData } from './table-cell-data.interface';
import { ITableDef } from './table.interface';

export interface IDataSourceTableDef extends ITableDef {
  readonly dataSourceInfo: IDataSourceColumnDef;
  readonly access: IDataSourceColumnDef;
  readonly lastUpdated: IDataSourceColumnDef;
}

export interface IDataSourceColumnDef {
  readonly columnName: string;
  readonly dataSourceId: string;
  readonly cellData?: ITableCellData;
}
