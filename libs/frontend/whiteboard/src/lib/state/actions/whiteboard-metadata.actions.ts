import { createAction, props } from '@ngrx/store';

import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';

const actionPrefix = '[Whiteboard Metadata]';

export const WhiteboardTitleChanged = createAction(`${actionPrefix} Title changed`);

export const WhiteboardDescriptionChanged = createAction(`${actionPrefix} Description changed`);

export const WhiteboardUserJoined = createAction(`${actionPrefix} User joined`, props<{ user: IUserForWhiteboard }>());

export const WhiteboardUserLeft = createAction(`${actionPrefix} User left`, props<{ userId: string }>());
