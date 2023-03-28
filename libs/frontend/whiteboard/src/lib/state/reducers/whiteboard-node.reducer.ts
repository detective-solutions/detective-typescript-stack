import {
  AnyWhiteboardNode,
  ICachableCasefileForWhiteboard,
  IWhiteboardNodePropertiesUpdate,
} from '@detective.solutions/shared/data-access';
import { Update, createEntityAdapter } from '@ngrx/entity';
import { WhiteboardGeneralActions, WhiteboardNodeActions } from '../actions';
import { createReducer, on } from '@ngrx/store';

import { IWhiteboardNodeState } from '../interfaces';
import { TableNodeActions } from '../../components';
import { serializeWhiteboardNodes } from '../../utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const whiteboardNodeEntityAdapter = createEntityAdapter<AnyWhiteboardNode>();

export const whiteboardNodeReducer = createReducer(
  whiteboardNodeEntityAdapter.getInitialState(),
  on(
    WhiteboardGeneralActions.WhiteboardDataLoaded,
    (state: IWhiteboardNodeState, action: { casefile: ICachableCasefileForWhiteboard }) =>
      whiteboardNodeEntityAdapter.setAll(serializeWhiteboardNodes(action.casefile.nodes), state)
  ),
  on(WhiteboardGeneralActions.ResetWhiteboardData, (state: IWhiteboardNodeState) =>
    whiteboardNodeEntityAdapter.removeAll(state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeAdded, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.addOne(action.addedNode, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeDeleted, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.removeOne(action.deletedNodeId, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodeDeletedRemotely, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.removeOne(action.deletedNodeId, state)
  ),
  on(WhiteboardNodeActions.WhiteboardUnblockAllNodesOnUserLeft, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateMany(action.updates, state)
  ),
  on(WhiteboardNodeActions.WhiteboardNodePropertiesUpdated, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateMany(
      // Update last modified date on each state modification
      action.updates.map((update: Update<IWhiteboardNodePropertiesUpdate>) => {
        return { id: update.id, changes: { lastUpdated: new Date().toISOString(), ...update.changes } };
      }),
      state
    )
  ),
  on(WhiteboardNodeActions.WhiteboardNodePropertiesUpdatedRemotely, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateMany(action.updates, state)
  ),
  on(TableNodeActions.TableDataReceived, (state: IWhiteboardNodeState, action: any) =>
    whiteboardNodeEntityAdapter.updateOne(action.update, state)
  )
);
