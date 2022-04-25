import { WhiteboardNodesState, initialWhiteboardNodesState, whiteboardNodesStateAdapter } from '../../../../../state';
import { createReducer, on } from '@ngrx/store';

import { TableNodeActions } from '../actions';

/* eslint-disable @typescript-eslint/no-explicit-any */

// TODO: Add strong typing for state
export const tableNodeReducer = createReducer(
  initialWhiteboardNodesState,
  on(TableNodeActions.tableNodeAdded, (state: WhiteboardNodesState, action: any) =>
    whiteboardNodesStateAdapter.addOne(action.tableElementAdded, state)
  ),
  on(TableNodeActions.tableDataReceived, (state: WhiteboardNodesState, action: any) =>
    whiteboardNodesStateAdapter.updateOne(action.update, state)
  )
);
