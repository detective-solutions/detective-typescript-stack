import { createAction, props } from '@ngrx/store';

import { AnyWhiteboardNode } from '../../models';
import { Update } from '@ngrx/entity';

const actionPrefix = '[Whiteboard Nodes]';

export const WhiteboardNodeAdded = createAction(
  `${actionPrefix} Node added`,
  props<{ addedNode: AnyWhiteboardNode; addedManually: boolean }>()
);
export const WhiteboardNodeUpdate = createAction(
  `${actionPrefix} Updating node`,
  props<{ update: Update<AnyWhiteboardNode> }>()
);
export const WhiteboardNodeLayoutUpdate = createAction(
  `${actionPrefix} Updating node layout`,
  props<{ updates: Update<AnyWhiteboardNode>[] }>()
);
