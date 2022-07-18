import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface IConnectionsTableDef extends IAbstractTableDef {
  dataSourceInfo: IColumnDef;
  status: IColumnDef;
  lastUpdated: IColumnDef;
  actions: IColumnDef;
}
