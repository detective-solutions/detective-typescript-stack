import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { WhiteboardActions } from '../actions';

/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WhiteboardNodesState extends EntityState<WhiteboardNodesState> {}
const whiteboardNodesStateAdapter = createEntityAdapter<WhiteboardNodesState>();
const initialWhiteboardNodesState = whiteboardNodesStateAdapter.getInitialState();

// TODO: Add strong typing for state
export const whiteboardNodesReducer = createReducer(
  initialWhiteboardNodesState,
  on(WhiteboardActions.tableNodeAdded, (state: WhiteboardNodesState, action: any) =>
    whiteboardNodesStateAdapter.addOne(action.tableElementAdded, state)
  ),
  on(WhiteboardActions.tableDataReceived, (state: WhiteboardNodesState, action: any) =>
    whiteboardNodesStateAdapter.updateOne(action.update, state)
  )
);

export const { selectIds, selectEntities, selectAll } = whiteboardNodesStateAdapter.getSelectors();
