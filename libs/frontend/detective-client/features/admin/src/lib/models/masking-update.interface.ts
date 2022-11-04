import { IMaskSubTableDataDef } from './maskings-table.interface';

export interface MaskDelete {
  columns: { xid: string }[];
  rows: { xid: string }[];
}

export interface MaskingUpdate {
  masking: {
    xid: string;
    name: string;
    description: string;
  };
  masks: IMaskSubTableDataDef[];
  toDelete: MaskDelete;
}
