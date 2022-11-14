import { IMaskSubTableDataDef } from './maskings-table.interface';

export interface IMaskDeleteInput {
  columns: { xid: string }[];
  rows: { xid: string }[];
}

export interface IMaskingUpdateInput {
  masking: {
    xid: string;
    name: string;
    description: string;
  };
  masks: IMaskSubTableDataDef[];
  toDelete: IMaskDeleteInput;
}
