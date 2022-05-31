import { INodeInput, Node } from '../../models';
import { WhiteboardNodesState, whiteboardNodesStateAdapter } from '../reducers';
import { createFeatureSelector, createSelector } from '@ngrx/store';

import { Dictionary } from '@ngrx/entity';
import { NODES_STORE_NAME } from '../state-constants';

const { selectEntities } = whiteboardNodesStateAdapter.getSelectors();

const selectWhiteboardNodesState = createFeatureSelector<WhiteboardNodesState>(NODES_STORE_NAME);
const selectWhiteboardEntities = createSelector(selectWhiteboardNodesState, selectEntities);

export const selectWhiteboardNodes = createSelector(
  selectWhiteboardEntities,
  (entities: Dictionary<WhiteboardNodesState>) => {
    if (Object.keys(entities).length > 0) {
      return (Object.values(entities as any) as INodeInput[]).map(Node.Build);
    }
    return [];
  }
);
