import { createAction, props } from '@ngrx/store';

import { INodeInput } from '../../models';
import { Update } from '@ngrx/entity';

const actionPrefix = '[Whiteboard]';

export const loadWhiteboardData = createAction(`${actionPrefix} Loading whiteboard data`);
export const whiteboardDataLoaded = createAction(
  `${actionPrefix} Whiteboard data loaded`,
  props<{ nodes: INodeInput[] }>()
);
export const resetWhiteboardData = createAction(`${actionPrefix} Resetting whiteboard data`);
export const WhiteboardNodeAdded = createAction(`${actionPrefix} Node added`, props<{ addedNode: INodeInput }>());
export const WhiteboardNodeUpdate = createAction(
  `${actionPrefix} Updating node`,
  props<{ update: Update<INodeInput> }>()
);
export const WhiteboardNodeLayoutUpdate = createAction(
  `${actionPrefix} Updating node layout`,
  props<{ updates: Update<INodeInput>[] }>()
);
