import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface IMaskingTableDef extends IAbstractTableDef {
  maskingInfo: IColumnDef;
  table: IColumnDef;
  userGroups: IColumnDef;
  lastUpdatedBy: IColumnDef;
  lastUpdated: IColumnDef;
  actions: IColumnDef;
}
