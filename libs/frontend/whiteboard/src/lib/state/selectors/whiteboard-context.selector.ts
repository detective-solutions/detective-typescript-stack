import { IWhiteboardState } from '../interfaces';
import { createSelector } from '@ngrx/store';
import { selectWhiteboardState } from './whiteboard-selector';

export const selectWhiteboardContextState = createSelector(selectWhiteboardState, (state: IWhiteboardState) => ({
  timestamp: new Date().getTime(),
  ...state.context,
}));
