import { createAction, props } from '@ngrx/store';

import { INodeInput } from '../../models';

const actionPrefix = '[Whiteboard]';

export const loadWhiteboardData = createAction(`${actionPrefix} Loading whiteboard data ...`);
export const whiteboardDataLoaded = createAction(
  `${actionPrefix} Whiteboard data loaded`,
  props<{ nodes: INodeInput[] }>()
);
export const resetWhiteboardData = createAction(`${actionPrefix} Reset whiteboard data`);
export const WhiteboardNodeAdded = createAction(`${actionPrefix} Node added`, props<{ addedNode: INodeInput }>());
