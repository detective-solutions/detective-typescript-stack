import * as fromWhiteboardNodes from '../../../../../state/reducers/whiteboard-nodes.reducer';

import { createFeatureSelector, createSelector } from '@ngrx/store';

import { NODES_STORE_NAME } from '../../../../../state';

export const selectTableNodeState = createFeatureSelector<fromWhiteboardNodes.WhiteboardNodesState>(NODES_STORE_NAME);

export const selectEntities = createSelector(selectTableNodeState, fromWhiteboardNodes.selectEntities);
