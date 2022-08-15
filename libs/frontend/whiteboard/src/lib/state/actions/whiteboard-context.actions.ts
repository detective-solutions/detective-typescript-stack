import { createAction, props } from '@ngrx/store';

import { IWhiteboardContextState } from '../interfaces';

const actionPrefix = '[Whiteboard Context]';

export const InitializeWhiteboardContext = createAction(
  `${actionPrefix} Initialize context`,
  props<{ context: IWhiteboardContextState }>()
);
