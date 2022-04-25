import { EntityState, createEntityAdapter } from '@ngrx/entity';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WhiteboardNodesState extends EntityState<WhiteboardNodesState> {}
export const whiteboardNodesStateAdapter = createEntityAdapter<WhiteboardNodesState>();
export const initialWhiteboardNodesState = whiteboardNodesStateAdapter.getInitialState();
export const { selectIds, selectEntities, selectAll } = whiteboardNodesStateAdapter.getSelectors();
