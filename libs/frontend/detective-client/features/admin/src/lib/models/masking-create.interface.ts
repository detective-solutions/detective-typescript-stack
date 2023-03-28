import { IMask } from '@detective.solutions/shared/data-access';
import { IMaskSubTableDataDef } from './maskings-table.interface';

export interface IMaskingCreateInput {
  masking: {
    id?: string;
    table: { id: string };
    groups: { id: string }[];
    name: string;
    tenant: { id: string };
    description: string;
    author?: { id: string };
    lastUpdated?: string;
    lastUpdatedBy?: { id: string };
    created?: string;
    columns?: IMask[];
    rows?: IMask[];
  };
  masks: IMaskSubTableDataDef[];
}
