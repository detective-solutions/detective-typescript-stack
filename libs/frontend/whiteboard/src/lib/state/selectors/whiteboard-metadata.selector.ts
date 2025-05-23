import { IWhiteboardMetadataState, IWhiteboardState } from '../interfaces';

import { createSelector } from '@ngrx/store';
import { selectWhiteboardState } from './whiteboard-selector';

const selectWhiteboardMetaDataState = createSelector(
  selectWhiteboardState,
  (state: IWhiteboardState) => state.metadata
);

export const selectIsWhiteboardTitleFocusedByDifferentUserId = (userId: string) =>
  createSelector(
    selectWhiteboardMetaDataState,
    (state: IWhiteboardMetadataState) => state.titleFocusedBy && state.titleFocusedBy !== userId
  );

export const selectWhiteboardTitle = createSelector(
  selectWhiteboardMetaDataState,
  (state: IWhiteboardMetadataState) => state.title
);

export const selectActiveUsers = createSelector(
  selectWhiteboardMetaDataState,
  (state: IWhiteboardMetadataState) => state.activeUsers
);
