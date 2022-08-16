import { createAction, props } from '@ngrx/store';

import { ITableWhiteboardNode } from '@detective.solutions/shared/data-access';
import { Update } from '@ngrx/entity';

const actionPrefix = '[Table Node]';

export const LoadTableData = createAction(
  `${actionPrefix} Requesting table data from backend`,
  props<{ node: ITableWhiteboardNode }>()
);

export const TableDataReceived = createAction(
  `${actionPrefix} Received table data from backend`,
  props<{ update: Update<ITableWhiteboardNode> }>()
);
