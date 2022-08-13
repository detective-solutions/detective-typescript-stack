import { createAction, props } from '@ngrx/store';

import { ICasefile } from '@detective.solutions/shared/data-access';

const actionPrefix = '[Whiteboard]';

export const loadWhiteboardData = createAction(`${actionPrefix} Loading whiteboard data`);

export const whiteboardDataLoaded = createAction(
  `${actionPrefix} Whiteboard data loaded`,
  props<{ casefile: ICasefile }>()
);
export const resetWhiteboardData = createAction(`${actionPrefix} Resetting whiteboard data`);
