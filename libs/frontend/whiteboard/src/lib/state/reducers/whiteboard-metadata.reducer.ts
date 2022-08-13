import { createReducer, on } from '@ngrx/store';

import { IWhiteboardMetadataState } from '../interfaces';
import { WhiteboardGeneralActions } from '../actions';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const initialWhiteboardMetadataState: IWhiteboardMetadataState = {
  id: '',
  title: '',
  description: '',
};

export const whiteboardMetadataReducer = createReducer(
  initialWhiteboardMetadataState,
  on(
    WhiteboardGeneralActions.whiteboardDataLoaded,
    (state: IWhiteboardMetadataState, action: any): IWhiteboardMetadataState => {
      return { ...state, id: action.id, title: action.title, description: action.description };
    }
  )
);
