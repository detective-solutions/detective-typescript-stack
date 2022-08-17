import { IWhiteboardNodeState, IWhiteboardState } from '../interfaces';

import { AnyWhiteboardNode } from '@detective.solutions/shared/data-access';
import { Dictionary } from '@ngrx/entity';
import { createSelector } from '@ngrx/store';
import { selectWhiteboardState } from './whiteboard-selector';
import { whiteboardNodeEntityAdapter } from '../reducers';

const { selectAll, selectEntities } = whiteboardNodeEntityAdapter.getSelectors();
const selectWhiteboardNodeState = createSelector(selectWhiteboardState, (state: IWhiteboardState) => state.nodes);
const selectWhiteboardNodeEntities = createSelector(selectWhiteboardNodeState, selectEntities);

export const selectAllWhiteboardNodes = createSelector(selectWhiteboardNodeState, (state: IWhiteboardNodeState) =>
  state
    ? selectAll(state).map((node: AnyWhiteboardNode) => {
        return { ...node };
      })
    : []
);
export const selectWhiteboardNodeById = (id: string) =>
  createSelector(selectWhiteboardNodeEntities, (entities: Dictionary<AnyWhiteboardNode>) => entities[id]);
