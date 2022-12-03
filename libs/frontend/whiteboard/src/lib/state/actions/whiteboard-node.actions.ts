import {
  AnyWhiteboardNode,
  IWhiteboardNodeBlockUpdate,
  IWhiteboardNodePropertiesUpdate,
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

export const WhiteboardUnblockAllNodesOnUserLeft = createAction(
  `${actionPrefix} Unblocking all nodes blocked by a user that left`,
  props<{ updates: Update<IWhiteboardNodeBlockUpdate>[] }>()
);

export const WhiteboardNodePropertiesUpdated = createAction(
  `${actionPrefix} Node properties updated`,
  props<{ updates: Update<IWhiteboardNodePropertiesUpdate>[] }>()
);
export const WhiteboardNodePropertiesUpdatedRemotely = createAction(
  `${actionPrefix} Node properties updated remotely`,
  props<{ updates: Update<IWhiteboardNodePropertiesUpdate>[] }>()
);
