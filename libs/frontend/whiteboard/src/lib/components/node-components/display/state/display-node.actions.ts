import { IDisplayWhiteboardNode, ITableWhiteboardNode } from '@detective.solutions/shared/data-access';
import { createAction, props } from '@ngrx/store';

import { Update } from '@ngrx/entity';

const actionPrefix = '[Display Node]';

export const LoadDisplayNodeData = createAction(
  `${actionPrefix} Uploading file to display`,
  props<{ nodeId: string; file: File }>()
);

export const DisplayNodeDataReceived = createAction(
  `${actionPrefix} Received backend information for uploaded file`,
  props<{ update: Update<IDisplayWhiteboardNode | ITableWhiteboardNode> }>()
);
