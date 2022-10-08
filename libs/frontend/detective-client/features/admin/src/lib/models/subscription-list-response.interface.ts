import { IInvoice } from './subscription-invoice-response.interface';

export interface IInvoiceListSchema {
  headerName: string;
  field: string;
  sortable: boolean;
  filter: boolean;
}

export interface IInvoiceListResponse {
  schema: IInvoiceListSchema[];
  data: IInvoice[];
  count: number;
}
