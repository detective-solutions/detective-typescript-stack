import { createAction, props } from '@ngrx/store';

import { AbstractNodeInput } from '../../models';
import { Update } from '@ngrx/entity';

const actionPrefix = '[Whiteboard Nodes]';

export const loadWhiteboardData = createAction(`${actionPrefix} Loading whiteboard data`);
export const whiteboardDataLoaded = createAction(
  `${actionPrefix} Whiteboard data loaded`,
  props<{ nodes: AbstractNodeInput[] }>()
);
export const resetWhiteboardData = createAction(`${actionPrefix} Resetting whiteboard data`);
export const WhiteboardNodeAdded = createAction(
  `${actionPrefix} Node added`,
  props<{ addedNode: AbstractNodeInput; addedManually: boolean }>()
);
export const WhiteboardNodeUpdate = createAction(
  `${actionPrefix} Updating node`,
  props<{ update: Update<AbstractNodeInput> }>()
);
export const WhiteboardNodeLayoutUpdate = createAction(
  `${actionPrefix} Updating node layout`,
  props<{ updates: Update<AbstractNodeInput>[] }>()
);
