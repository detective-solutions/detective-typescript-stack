import { IWhiteboardContextState, IWhiteboardMetadataState, IWhiteboardNodeState } from '.';

export interface IWhiteboardState {
  context: IWhiteboardContextState;
  metadata: IWhiteboardMetadataState;
  nodes: IWhiteboardNodeState;
}
