import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface IMaskingTableDef extends IAbstractTableDef {
  maskingInfo: IColumnDef;
  table: IColumnDef;
  lastUpdated: IColumnDef;
}
