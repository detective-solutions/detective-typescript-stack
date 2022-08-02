import { AbstractNodeInput } from '../../models';
import { Dictionary } from '@ngrx/entity';
import { IWhiteboardState } from '../interfaces';
import { createSelector } from '@ngrx/store';
import { selectWhiteboardState } from './whiteboard-selector';
import { serializeNodeForWhiteboard } from '../../utils';
import { whiteboardNodeEntityAdapter } from '../reducers';

const { selectEntities } = whiteboardNodeEntityAdapter.getSelectors();

const selectWhiteboardNodeState = createSelector(selectWhiteboardState, (state: IWhiteboardState) => state.nodes);
const selectWhiteboardNodeEntities = createSelector(selectWhiteboardNodeState, selectEntities);

export const selectAllWhiteboardNodes = createSelector(
  selectWhiteboardNodeEntities,
  (entities: Dictionary<AbstractNodeInput>) => {
    if (Object.keys(entities).length > 0) {
      return (Object.values(entities) as AbstractNodeInput[]).map((nodeInput: AbstractNodeInput) =>
        serializeNodeForWhiteboard(nodeInput)
      );
    }
    return [];
  }
);

export const selectWhiteboardNodeById = (id: string) =>
  createSelector(selectWhiteboardState, (state: IWhiteboardState) =>
    serializeNodeForWhiteboard(state.nodes.entities[id] as AbstractNodeInput)
  );
