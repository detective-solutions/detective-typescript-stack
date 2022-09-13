import { WhiteboardNodeType } from './whiteboard-node-types.enum';

export interface IWhiteboardNodeDeletedUpdate {
  id: string;
  type: WhiteboardNodeType;
}
