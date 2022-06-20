import { TableCellEventType } from './table-cell-event-type.enum';

export interface ITableCellEvent {
  id: string;
  type: TableCellEventType;
  value?: string | boolean;
}
