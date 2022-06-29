import { TableCellData } from './table-cell-data.interface';

export interface IColumnDef {
  columnName: string;
  cellData: TableCellData;
}

export interface IMatColumnDef {
  id: string;
  name: string;
}
