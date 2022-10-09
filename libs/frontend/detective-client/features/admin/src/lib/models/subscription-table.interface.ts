import { IAbstractTableDef, IColumnDef } from '@detective.solutions/frontend/detective-client/ui';

export interface IInvoiceTableDef extends IAbstractTableDef {
  invoice: IColumnDef;
  period: IColumnDef;
  interval: IColumnDef;
  amount: IColumnDef;
  status: IColumnDef;
  actions: IColumnDef;
}
