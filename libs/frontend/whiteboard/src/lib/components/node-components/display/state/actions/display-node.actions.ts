import { createAction, props } from '@ngrx/store';

import { IDisplayWhiteboardNode } from '@detective.solutions/shared/data-access';
import { Update } from '@ngrx/entity';

const actionPrefix = '[Display Node]';

export const loadDisplayFiles = createAction(
  `${actionPrefix} Requesting table data from backend`,
  props<{ node: IDisplayWhiteboardNode }>()
);

export const DisplayFilesReceived = createAction(
  `${actionPrefix} Received table data from backend`,
  props<{ update: Update<IDisplayWhiteboardNode> }>()
);
