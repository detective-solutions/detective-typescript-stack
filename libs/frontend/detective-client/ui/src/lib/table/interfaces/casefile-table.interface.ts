import { ITableCellData } from './table-cell-data.interface';
import { ITableDef } from './table.interface';

export interface ICasefileTableDef extends ITableDef {
  readonly casefileInfo: ICasefileColumnDef;
  readonly access: ICasefileColumnDef;
  readonly owner: ICasefileColumnDef;
  readonly starred: ICasefileColumnDef;
  readonly views: ICasefileColumnDef;
  readonly investigators: ICasefileColumnDef;
  readonly lastUpdated: ICasefileColumnDef;
}

export interface ICasefileColumnDef {
  readonly columnName: string;
  readonly casefileId: string;
  readonly cellData?: ITableCellData;
}
