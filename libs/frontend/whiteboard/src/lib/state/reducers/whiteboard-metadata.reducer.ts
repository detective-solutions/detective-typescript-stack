import { WhiteboardGeneralActions, WhiteboardMetadataActions } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { ICachableCasefileForWhiteboard } from '@detective.solutions/shared/data-access';
import { IWhiteboardMetadataState } from '../interfaces';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const initialWhiteboardMetadataState: IWhiteboardMetadataState = {
  id: '',
  title: '',
  description: '',
  activeUsers: [],
};

export const whiteboardMetadataReducer = createReducer(
  initialWhiteboardMetadataState,
  on(
    WhiteboardGeneralActions.WhiteboardDataLoaded,
    (
      state: IWhiteboardMetadataState,
      action: { casefile: ICachableCasefileForWhiteboard }
    ): IWhiteboardMetadataState => {
      return {
        ...state,
        id: action.casefile.id,
        title: action.casefile.title,
        description: action.casefile.description,
        activeUsers: action.casefile.temporary.activeUsers,
      };
    }
  ),
  on(
    WhiteboardMetadataActions.WhiteboardUserJoined,
    (state: IWhiteboardMetadataState, action: any): IWhiteboardMetadataState => {
      const activeUsers = [...state.activeUsers];
      activeUsers.push(action.user);
      return { ...state, activeUsers: activeUsers };
    }
  ),
  on(
    WhiteboardMetadataActions.WhiteboardUserLeft,
    (state: IWhiteboardMetadataState, action: any): IWhiteboardMetadataState => {
      state.activeUsers.filter((user) => user.id !== action.userId);
      return state;
    }
  )
);
