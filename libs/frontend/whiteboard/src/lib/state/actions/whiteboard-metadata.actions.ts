import { createAction } from '@ngrx/store';

const actionPrefix = '[Whiteboard Metadata]';

export const WhiteboardTitleChanged = createAction(`${actionPrefix} Title changed`);

export const WhiteboardDescriptionChanged = createAction(`${actionPrefix} Description changed`);
