import { WhiteboardNodeType } from './whiteboard-node-types.enum';

export interface IWhiteboardNodePositionUpdate {
  id: string;
  x: number;
  y: number;
  type: WhiteboardNodeType;
}
