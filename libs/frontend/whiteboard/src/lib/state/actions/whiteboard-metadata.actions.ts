import { createAction, props } from '@ngrx/store';

import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';

const actionPrefix = '[Whiteboard Metadata]';

export const WhiteboardUserJoined = createAction(`${actionPrefix} User joined`, props<{ user: IUserForWhiteboard }>());
export const WhiteboardUserLeft = createAction(`${actionPrefix} User left`, props<{ userId: string }>());
export const WhiteboardTitleUpdated = createAction(`${actionPrefix} Title updated`, props<{ title: string }>());
export const WhiteboardTitleUpdatedRemotely = createAction(
  `${actionPrefix} Title updated remotely`,
  props<{ title: string }>()
);
