import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface IUserGroupsTableDef extends IAbstractTableDef {
  groupName: IColumnDef;
  members: IColumnDef;
  lastUpdated: IColumnDef;
  actions: IColumnDef;
}
