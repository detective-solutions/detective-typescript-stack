import { Action, ActionReducer, ActionReducerMap } from '@ngrx/store';

import { IWhiteboardState } from '../interfaces';
import { whiteboardContextReducer } from './whiteboard-context.reducer';
import { whiteboardMetadataReducer } from './whiteboard-metadata.reducer';
import { whiteboardNodeReducer } from './whiteboard-node.reducer';

export * from './whiteboard-node.reducer';

export const whiteboardFeatureReducers: ActionReducerMap<ActionReducer<IWhiteboardState, Action>> = {
  context: whiteboardContextReducer,
  metadata: whiteboardMetadataReducer,
  nodes: whiteboardNodeReducer,
};
