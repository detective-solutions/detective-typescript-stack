import { createAction, props } from '@ngrx/store';

import { IDisplayWhiteboardNode } from '@detective.solutions/shared/data-access';
import { Update } from '@ngrx/entity';

const actionPrefix = '[Display Node]';

export const LoadDisplayFiles = createAction(
  `${actionPrefix} Uploading file to display`,
  props<{ nodeId: string; file: File }>()
);

export const DisplayFilesReceived = createAction(
  `${actionPrefix} Received uploaded file`,
  props<{ update: Update<IDisplayWhiteboardNode> }>()
);
