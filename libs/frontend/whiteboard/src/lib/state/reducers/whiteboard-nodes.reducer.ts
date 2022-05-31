import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { TableNodeActions } from '../../components/node-components/table/state';
import { WhiteboardActions } from '../actions';

/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WhiteboardNodesState extends EntityState<WhiteboardNodesState> {}
export const whiteboardNodesStateAdapter = createEntityAdapter<WhiteboardNodesState>();
export const initialWhiteboardNodesState = whiteboardNodesStateAdapter.getInitialState();

export const whiteboardNodesReducer = createReducer(
  initialWhiteboardNodesState,
  on(WhiteboardActions.resetWhiteboardData, (state: WhiteboardNodesState) =>
    whiteboardNodesStateAdapter.removeAll(state)
  ),
  on(WhiteboardActions.whiteboardDataLoaded, (state: WhiteboardNodesState, action: any) =>
    whiteboardNodesStateAdapter.setAll(action.nodes, state)
  ),
  on(WhiteboardActions.WhiteboardNodeAdded, (state: WhiteboardNodesState, action: any) =>
    whiteboardNodesStateAdapter.addOne(action.addedNode, state)
  ),
  on(WhiteboardActions.WhiteboardNodeUpdate, (state: WhiteboardNodesState, action: any) =>
    whiteboardNodesStateAdapter.updateOne(action.update, state)
  ),
  on(WhiteboardActions.WhiteboardNodeLayoutUpdate, (state: WhiteboardNodesState, action: any) =>
    whiteboardNodesStateAdapter.updateMany(action.updates, state)
  ),
  on(TableNodeActions.tableNodeAdded, (state: WhiteboardNodesState, action: any) =>
    whiteboardNodesStateAdapter.addOne(action.tableElementAdded, state)
  ),
  on(TableNodeActions.tableDataReceived, (state: WhiteboardNodesState, action: any) =>
    whiteboardNodesStateAdapter.updateOne(action.update, state)
  )
);
