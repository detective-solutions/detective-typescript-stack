import { createReducer, on } from '@ngrx/store';

import { IWhiteboardContextState } from '../interfaces';
import { WhiteboardContextActions } from '../actions';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const initialWhiteboardContextState: IWhiteboardContextState = {
  tenantId: '',
  casefileId: '',
  userId: '',
  userRole: '',
};

export const whiteboardContextReducer = createReducer(
  initialWhiteboardContextState,
  on(
    WhiteboardContextActions.InitializeWhiteboardContext,
    (_state: IWhiteboardContextState, action: any): IWhiteboardContextState => {
      {
        return { ...action.context };
      }
    }
  )
);
