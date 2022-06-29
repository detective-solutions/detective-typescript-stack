import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface IConnectionsTableDef extends IAbstractTableDef {
  dataSourceInfo: IColumnDef;
  state: IColumnDef;
  lastUpdated: IColumnDef;
  actions: IColumnDef;
}
