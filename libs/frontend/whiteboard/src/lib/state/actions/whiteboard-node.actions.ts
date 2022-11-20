import {
  AnyWhiteboardNode,
  IWhiteboardNodeBlockUpdate,
  IWhiteboardNodePositionUpdate,
  IWhiteboardNodeSizeUpdate,
  IWhiteboardNodeTitleUpdate,
} from '@detective.solutions/shared/data-access';
import { createAction, props } from '@ngrx/store';

import { Update } from '@ngrx/entity';

const actionPrefix = '[Whiteboard Node]';

export const WhiteboardNodeAdded = createAction(
  `${actionPrefix} Node added`,
  props<{ addedNode: AnyWhiteboardNode; addedManually: boolean }>()
);

export const WhiteboardNodeDeleted = createAction(`${actionPrefix} Node deleted`, props<{ deletedNodeId: string }>());

export const WhiteboardNodeDeletedRemotely = createAction(
  `${actionPrefix} Node deleted remotely`,
  props<{ deletedNodeId: string }>()
);

export const WhiteboardNodeUpdate = createAction(
  `${actionPrefix} Node updated`,
  props<{ update: Update<AnyWhiteboardNode> }>()
);

export const WhiteboardNodeBatchUpdate = createAction(
  `${actionPrefix} Multiple nodes updated`,
  props<{ updates: Update<AnyWhiteboardNode>[] }>()
);

export const WhiteboardNodeBlocked = createAction(
  `${actionPrefix} Node blocked`,
  props<{ update: Update<IWhiteboardNodeBlockUpdate> }>()
);

export const WhiteboardNodeUnblocked = createAction(
  `${actionPrefix} Node unblocked`,
  props<{ update: Update<IWhiteboardNodeBlockUpdate> }>()
);

export const WhiteboardNodeBlockedRemotely = createAction(
  `${actionPrefix} Node un/blocked remotely`,
  props<{ update: Update<IWhiteboardNodeBlockUpdate> }>()
);

export const WhiteboardUnblockAllNodesOnUserLeft = createAction(
  `${actionPrefix} Unblocking all nodes blocked by a user that left`,
  props<{ updates: Update<IWhiteboardNodeBlockUpdate>[] }>()
);

export const WhiteboardNodesPositionUpdated = createAction(
  `${actionPrefix} Node positions updated`,
  props<{ updates: Update<IWhiteboardNodePositionUpdate>[] }>()
);

export const WhiteboardNodesPositionUpdatedRemotely = createAction(
  `${actionPrefix} Node positions updated remotely`,
  props<{ updates: Update<AnyWhiteboardNode>[] }>()
);

export const WhiteboardNodeResized = createAction(
  `${actionPrefix} Node resized`,
  props<{ update: Update<IWhiteboardNodeSizeUpdate> }>()
);

export const WhiteboardNodeResizedRemotely = createAction(
  `${actionPrefix} Node resized remotely`,
  props<{ update: Update<IWhiteboardNodeSizeUpdate> }>()
);

export const WhiteboardNodeTitleUpdated = createAction(
  `${actionPrefix} Node title updated`,
  props<{ update: Update<IWhiteboardNodeTitleUpdate> }>()
);
export const WhiteboardNodeTitleUpdatedRemotely = createAction(
  `${actionPrefix} Node title updated remotely`,
  props<{ update: Update<IWhiteboardNodeTitleUpdate> }>()
);
