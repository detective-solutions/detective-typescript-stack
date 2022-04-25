import { WhiteboardNodesState, whiteboardNodesStateAdapter } from '../reducers';
import { createFeatureSelector, createSelector } from '@ngrx/store';

import { NODES_STORE_NAME } from '../state-constants';

const { selectEntities } = whiteboardNodesStateAdapter.getSelectors();

export const selectWhiteboardNodesState = createFeatureSelector<WhiteboardNodesState>(NODES_STORE_NAME);

export const selectWhiteboardNodesFromStore = createSelector(selectWhiteboardNodesState, selectEntities);
