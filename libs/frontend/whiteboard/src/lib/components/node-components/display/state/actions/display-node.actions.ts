import { createAction, props } from '@ngrx/store';

import { IDisplayWhiteboardNode } from '@detective.solutions/shared/data-access';
import { Update } from '@ngrx/entity';

const actionPrefix = '[Display Node]';

export const loadDisplayFiles = createAction(
  `${actionPrefix} Load uploaded file`,
  props<{ node: IDisplayWhiteboardNode }>()
);

export const DisplayFilesReceived = createAction(
  `${actionPrefix} Received uploaded file`,
  props<{ update: Update<IDisplayWhiteboardNode> }>()
);
