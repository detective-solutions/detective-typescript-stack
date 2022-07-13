import { INodeInput, Node } from '../../models';

import { Dictionary } from '@ngrx/entity';
import { IWhiteboardState } from '../interfaces';
import { createSelector } from '@ngrx/store';
import { selectWhiteboardState } from './whiteboard-selector';
import { whiteboardNodeEntityAdapter } from '../reducers';

const { selectEntities } = whiteboardNodeEntityAdapter.getSelectors();

const selectWhiteboardNodeState = createSelector(selectWhiteboardState, (state: IWhiteboardState) => state.nodes);
const selectWhiteboardNodeEntities = createSelector(selectWhiteboardNodeState, selectEntities);

export const selectAllWhiteboardNodes = createSelector(
  selectWhiteboardNodeEntities,
  (entities: Dictionary<INodeInput>) => {
    if (Object.keys(entities).length > 0) {
      return (Object.values(entities) as INodeInput[]).map(Node.Build);
    }
    return [];
  }
);

export const selectWhiteboardNodeById = (id: string) =>
  createSelector(selectWhiteboardState, (state: IWhiteboardState) =>
    Node.Build(state.nodes.entities[id] as INodeInput)
  );
