import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface IDataSourceTableDef extends IAbstractTableDef {
  dataSourceInfo: IColumnDef;
  access: IColumnDef;
  lastUpdated: IColumnDef;
  actions: IColumnDef;
}
