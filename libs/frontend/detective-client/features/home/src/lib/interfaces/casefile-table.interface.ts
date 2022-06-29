import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface ICasefileTableDef extends IAbstractTableDef {
  casefileInfo: IColumnDef;
  access: IColumnDef;
  owner: IColumnDef;
  starred: IColumnDef;
  views: IColumnDef;
  investigators: IColumnDef;
  lastUpdated: IColumnDef;
}
