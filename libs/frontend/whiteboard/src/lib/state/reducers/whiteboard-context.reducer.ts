import { IWhiteboardContextState } from '../interfaces';
import { createReducer } from '@ngrx/store';

export const initialWhiteboardContextState: IWhiteboardContextState = {
  tenantId: '',
  casefileId: '',
  userId: '',
  userRole: '',
};

export const whiteboardContextReducer = createReducer(initialWhiteboardContextState);
