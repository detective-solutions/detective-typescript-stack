import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface IUsersTableDef extends IAbstractTableDef {
  userName: IColumnDef;
  role: IColumnDef;
  lastUpdated: IColumnDef;
  actions: IColumnDef;
}
