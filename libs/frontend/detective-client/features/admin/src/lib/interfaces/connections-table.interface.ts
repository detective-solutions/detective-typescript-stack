import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface IConnectionsTableDef extends IAbstractTableDef {
  dataSourceInfo: IColumnDef;
  access: IColumnDef;
  lastUpdated: IColumnDef;
  actions: IColumnDef;
}
