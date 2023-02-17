import { IMaskSubTableDataDef } from './maskings-table.interface';
import { IMasking } from '@detective.solutions/shared/data-access';

export interface IMaskingUpdateInput {
  masking: {
    id: string;
    name: string;
    description: string;
  };
  masks: IMaskSubTableDataDef[];
  toDelete: Partial<IMasking>;
}
