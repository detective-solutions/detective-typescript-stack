import { createAction, props } from '@ngrx/store';

import { AnyWhiteboardNode } from '@detective.solutions/shared/data-access';
import { Update } from '@ngrx/entity';

const actionPrefix = '[Whiteboard Node]';

export const WhiteboardNodeUpdate = createAction(
  `${actionPrefix} Updating node`,
  props<{ update: Update<AnyWhiteboardNode> }>()
);

export const WhiteboardNodeBatchUpdate = createAction(
  `${actionPrefix} Updating multiple nodes`,
  props<{ updates: Update<AnyWhiteboardNode>[] }>()
);
