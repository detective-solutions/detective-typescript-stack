import { IAbstractTableDef, TableCellData } from '@detective.solutions/frontend/detective-client/ui';

export interface ICasefileTableDef extends IAbstractTableDef {
  casefileInfo: ICasefileColumnDef;
  access: ICasefileColumnDef;
  owner: ICasefileColumnDef;
  starred: ICasefileColumnDef;
  views: ICasefileColumnDef;
  investigators: ICasefileColumnDef;
  lastUpdated: ICasefileColumnDef;
}

export interface ICasefileColumnDef {
  columnName: string;
  cellData: TableCellData;
}
