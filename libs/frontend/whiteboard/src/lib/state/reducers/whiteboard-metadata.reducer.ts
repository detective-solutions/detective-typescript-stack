import { ICachableCasefileForWhiteboard, IUserForWhiteboard } from '@detective.solutions/shared/data-access';
import { WhiteboardGeneralActions, WhiteboardMetadataActions } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { IWhiteboardMetadataState } from '../interfaces';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const initialWhiteboardMetadataState: IWhiteboardMetadataState = {
  id: '',
  title: '',
  titleFocusedBy: null,
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
        id: action.casefile.xid,
        title: action.casefile.title,
        description: action.casefile.description,
        // Deep copy & sort active users by their ids
        activeUsers: sortActiveUsers([...action.casefile.temporary.activeUsers]),
      };
    }
  ),
  on(
    WhiteboardMetadataActions.WhiteboardUserJoined,
    (state: IWhiteboardMetadataState, action: any): IWhiteboardMetadataState => {
      // Deep copy, enhance & sort active users by their ids
      return { ...state, activeUsers: sortActiveUsers([...state.activeUsers, action.user]) };
    }
  ),
  on(
    WhiteboardMetadataActions.WhiteboardUserLeft,
    (state: IWhiteboardMetadataState, action: any): IWhiteboardMetadataState => {
      return {
        ...state,
        // Deep copy, filter and sort active users by their ids
        activeUsers: sortActiveUsers([...state.activeUsers].filter((user) => user.id !== action.userId)),
      };
    }
  ),
  on(
    WhiteboardMetadataActions.WhiteboardTitleFocused,
    (state: IWhiteboardMetadataState, action: any): IWhiteboardMetadataState => {
      return { ...state, titleFocusedBy: action.titleFocusedBy };
    }
  ),
  on(
    WhiteboardMetadataActions.WhiteboardTitleFocusedRemotely,
    (state: IWhiteboardMetadataState, action: any): IWhiteboardMetadataState => {
      return { ...state, titleFocusedBy: action.titleFocusedBy };
    }
  ),
  on(
    WhiteboardMetadataActions.WhiteboardTitleUpdated,
    (state: IWhiteboardMetadataState, action: any): IWhiteboardMetadataState => {
      return { ...state, title: action.title };
    }
  ),
  on(
    WhiteboardMetadataActions.WhiteboardTitleUpdatedRemotely,
    (state: IWhiteboardMetadataState, action: any): IWhiteboardMetadataState => {
      return { ...state, title: action.title };
    }
  )
);

function sortActiveUsers(activeUsers: IUserForWhiteboard[]) {
  return activeUsers.sort((a, b) => a.id.localeCompare(b.id));
}
