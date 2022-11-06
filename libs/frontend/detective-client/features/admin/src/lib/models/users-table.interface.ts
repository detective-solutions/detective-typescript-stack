import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface IUserTableDef extends IAbstractTableDef {
  userName: IColumnDef;
  role: IColumnDef;
  lastUpdated: IColumnDef;
  actions: IColumnDef;
}
