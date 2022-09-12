import {
  AnyWhiteboardNode,
  IWhiteboardNodeBlockUpdate,
  IWhiteboardNodePositionUpdate,
} from '@detective.solutions/shared/data-access';
import { createAction, props } from '@ngrx/store';

import { Update } from '@ngrx/entity';

const actionPrefix = '[Whiteboard Node]';

export const WhiteboardNodeAdded = createAction(
  `${actionPrefix} Node added`,
  props<{ addedNode: AnyWhiteboardNode; addedManually: boolean }>()
);

export const WhiteboardNodeDeleted = createAction(
  `${actionPrefix} Node deleted`,
  props<{ deletedNode: AnyWhiteboardNode }>()
);

export const WhiteboardNodeUpdate = createAction(
  `${actionPrefix} Updating node`,
  props<{ update: Update<AnyWhiteboardNode> }>()
);

export const WhiteboardNodeBatchUpdate = createAction(
  `${actionPrefix} Updating multiple nodes`,
  props<{ updates: Update<AnyWhiteboardNode>[] }>()
);

export const WhiteboardNodeBlocked = createAction(
  `${actionPrefix} Blocking node`,
  props<{ update: Update<IWhiteboardNodeBlockUpdate> }>()
);
export const WhiteboardNodeUnblocked = createAction(
  `${actionPrefix} Unblocking node`,
  props<{ update: Update<IWhiteboardNodeBlockUpdate> }>()
);

export const WhiteboardNodeRemoteBlockUpdate = createAction(
  `${actionPrefix} Received remote node blocking information`,
  props<{ update: Update<IWhiteboardNodeBlockUpdate> }>()
);

export const WhiteboardNodesMoved = createAction(
  `${actionPrefix} Updating node positions`,
  props<{ updates: Update<IWhiteboardNodePositionUpdate>[] }>()
);

export const WhiteboardNodesMovedRemotely = createAction(
  `${actionPrefix} Updating remote node positions`,
  props<{ updates: Update<AnyWhiteboardNode>[] }>()
);
