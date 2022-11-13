import { IMask } from '@detective.solutions/shared/data-access';
import { IMaskSubTableDataDef } from './maskings-table.interface';

export interface IMaskingCreateInput {
  masking: {
    table: { xid: string };
    groups: { xid: string }[];
    name: string;
    description: string;
    xid?: string;
    author?: { xid: string };
    lastUpdated?: string;
    lastUpdatedBy?: { xid: string };
    created?: string;
    columns?: IMask[];
    rows?: IMask[];
  };
  masks: IMaskSubTableDataDef[];
}
