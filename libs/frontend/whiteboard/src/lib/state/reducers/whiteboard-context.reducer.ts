import { createReducer, on } from '@ngrx/store';

import { IWhiteboardContextState } from '../interfaces';
import { WhiteboardContextActions } from '../actions';

export const initialWhiteboardContextState: IWhiteboardContextState = {
  tenantId: '',
  casefileId: '',
  userId: '',
  userRole: '',
};

export const whiteboardContextReducer = createReducer(
  initialWhiteboardContextState,
  on(WhiteboardContextActions.initializeWhiteboardContext, (_state: IWhiteboardContextState, action: any) => ({
    ...action.context,
  }))
);
