import { createAction } from '@ngrx/store';

const actionPrefix = '[Whiteboard Context]';

export const initializeWhiteboardContext = createAction(`${actionPrefix} Initialize context`);
