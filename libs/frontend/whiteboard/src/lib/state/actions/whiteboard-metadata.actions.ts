import { createAction } from '@ngrx/store';

const actionPrefix = '[Whiteboard Metadata]';

export const whiteboardTitleChanged = createAction(`${actionPrefix} Title changed`);
export const whiteboardDescriptionChanged = createAction(`${actionPrefix} Description changed`);
