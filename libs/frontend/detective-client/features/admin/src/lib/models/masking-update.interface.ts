import { IMaskSubTableDataDef } from './maskings-table.interface';

export interface IMaskDeleteInput {
  columns: { id: string }[];
  rows: { id: string }[];
}

export interface IMaskingUpdateInput {
  masking: {
    id: string;
    name: string;
    description: string;
  };
  masks: IMaskSubTableDataDef[];
  toDelete: IMaskDeleteInput;
}
