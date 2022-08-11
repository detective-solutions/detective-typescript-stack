import { createAction, props } from '@ngrx/store';

import { ITableWhiteboardNode } from '../../../../../models';
import { Update } from '@ngrx/entity';

export const tableDataReceived = createAction(
  '[Table Element] Received table data from backend',
  props<{ update: Update<ITableWhiteboardNode> }>()
);
