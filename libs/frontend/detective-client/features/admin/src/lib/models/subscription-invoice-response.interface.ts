export interface IInvoice {
  invoice: string;
  period: string;
  interval: string;
  amount: number;
  currency: string;
  status: boolean;
  invoice_pdf: string;
}
