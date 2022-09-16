import { WhiteboardGeneralActions, WhiteboardNodeActions } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { AnyWhiteboardNode } from '@detective.solutions/shared/data-access';
import { IWhiteboardNodeState } from '../interfaces';
import { TableNodeActions } from '../../components/node-components/table/state';
import { createEntityAdapter } from '@ngrx/entity';
import { serializeWhiteboardNodes } from '../../utils/serialize-whiteboard-nodes';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const whiteboardNodeEntityAdapter = createEntityAdapter<AnyWhiteboardNode>();

export const whiteboardNodeReducer = createReducer(
  whiteboardNodeEntityAdapter.getInitialState(),
  on(WhiteboardGeneralActions.ResetWhiteboardData, (state: IWhiteboardNodeState) =>
    whiteboardNodeEntityAdapter.removeAll(state)
  ),
  on(WhiteboardGeneralActions.WhiteboardDataLoaded, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.setAll(serializeWhiteboardNodes(action.casefile), state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeAdded, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.addOne(action.addedNode, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeDeleted, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.removeOne(action.deletedNode.id, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeDeletedRemotely, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.removeOne(action.deletedNode.id, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeBlocked, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateOne(action.update, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeUnblocked, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateOne(action.update, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeRemoteBlockUpdate, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateOne(action.update, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeUpdate, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateOne(action.update, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodesMoved, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateMany(action.updates, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodesMovedRemotely, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateMany(action.updates, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeBatchUpdate, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateMany(action.updates, state)
  ),
  on(TableNodeActions.TableDataReceived, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateOne(action.update, state)
  )
);
