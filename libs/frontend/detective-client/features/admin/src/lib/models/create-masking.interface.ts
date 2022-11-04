import { IMaskSubTableDataDef } from './maskings-table.interface';
import { Mask } from '@detective.solutions/shared/data-access';

export interface MaskingCreate {
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
    columns?: Mask[];
    rows?: Mask[];
  };
  masks: IMaskSubTableDataDef[];
}
