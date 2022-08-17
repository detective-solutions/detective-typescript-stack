import { AnyWhiteboardNode, ICasefile } from '@detective.solutions/shared/data-access';
import { createAction, props } from '@ngrx/store';

const actionPrefix = '[Whiteboard]';

export const LoadWhiteboardData = createAction(`${actionPrefix} Loading whiteboard data`);

export const WhiteboardDataLoaded = createAction(
  `${actionPrefix} Whiteboard data loaded`,
  props<{ casefile: ICasefile }>()
);
export const ResetWhiteboardData = createAction(`${actionPrefix} Resetting whiteboard data`);

export const WhiteboardNodeAdded = createAction(
  `${actionPrefix} Node added`,
  props<{ addedNode: AnyWhiteboardNode; addedManually: boolean }>()
);
