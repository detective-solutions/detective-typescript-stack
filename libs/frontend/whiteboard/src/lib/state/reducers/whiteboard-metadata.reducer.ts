import { WhiteboardGeneralActions, WhiteboardMetadataActions } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { ICachableCasefileForWhiteboard } from '@detective.solutions/shared/data-access';
import { IWhiteboardMetadataState } from '../interfaces';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const initialWhiteboardMetadataState: IWhiteboardMetadataState = {
  id: '',
  title: '',
  titleFocusedBy: null,
  description: '',
  activeUsers: new Set(),
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
        activeUsers: new Set(action.casefile.temporary.activeUsers),
      };
    }
  ),
  on(
    WhiteboardMetadataActions.WhiteboardUserJoined,
    (state: IWhiteboardMetadataState, action: any): IWhiteboardMetadataState => {
      const activeUsers = Array.from(state.activeUsers); // deep-copy array
      activeUsers.push(action.user);
      // Sort users by their ids
      return { ...state, activeUsers: new Set(activeUsers.sort((a, b) => a.id.localeCompare(b.id))) };
    }
  ),
  on(
    WhiteboardMetadataActions.WhiteboardUserLeft,
    (state: IWhiteboardMetadataState, action: any): IWhiteboardMetadataState => {
      // Filter & sort users by their ids
      const updatedActiveUsers = Array.from(state.activeUsers)
        .filter((user) => user.id !== action.userId)
        .sort((a, b) => a.id.localeCompare(b.id));
      return { ...state, activeUsers: new Set(updatedActiveUsers) };
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
