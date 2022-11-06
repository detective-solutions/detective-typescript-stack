import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface IGroupTableDef extends IAbstractTableDef {
  groupName: IColumnDef;
  members: IColumnDef;
  lastUpdated: IColumnDef;
  actions: IColumnDef;
}
