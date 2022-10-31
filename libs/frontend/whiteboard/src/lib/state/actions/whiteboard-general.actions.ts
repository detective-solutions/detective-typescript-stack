import { createAction, props } from '@ngrx/store';

import { ICachableCasefileForWhiteboard } from '@detective.solutions/shared/data-access';

const actionPrefix = '[Whiteboard]';

export const LoadWhiteboardData = createAction(`${actionPrefix} Loading whiteboard data`);

export const WhiteboardDataLoaded = createAction(
  `${actionPrefix} Whiteboard data loaded`,
  props<{ casefile: ICachableCasefileForWhiteboard }>()
);
export const ResetWhiteboardData = createAction(`${actionPrefix} Resetting whiteboard data`);

export const WhiteboardCursorMoved = createAction(`${actionPrefix} Cursor moved`, props<{ x: number; y: number }>());

export const WhiteboardCursorMovedRemotely = createAction(
  `${actionPrefix} Cursor moved remotely`,
  props<{ x: number; y: number }>()
);
