import { createReducer, on } from '@ngrx/store';

import { AbstractNodeInput } from '../../models';
import { IWhiteboardNodeState } from '../interfaces';
import { TableNodeActions } from '../../components/node-components/table/state';
import { WhiteboardNodeActions } from '../actions';
import { createEntityAdapter } from '@ngrx/entity';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const whiteboardNodeEntityAdapter = createEntityAdapter<AbstractNodeInput>();

export const whiteboardNodeReducer = createReducer(
  whiteboardNodeEntityAdapter.getInitialState(),
  on(WhiteboardNodeActions.resetWhiteboardData, (state: IWhiteboardNodeState) =>
    whiteboardNodeEntityAdapter.removeAll(state)
  ),
  on(WhiteboardNodeActions.whiteboardDataLoaded, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.setAll(action.nodes, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeAdded, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.addOne(action.addedNode, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeUpdate, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateOne(action.update, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeLayoutUpdate, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateMany(action.updates, state)
  ),
  on(TableNodeActions.tableDataReceived, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateOne(action.update, state)
  )
);
