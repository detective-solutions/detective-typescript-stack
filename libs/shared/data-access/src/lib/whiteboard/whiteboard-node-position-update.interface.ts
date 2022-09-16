import { IGeneralWhiteboardNode } from './general-whiteboard-node.interface';

export interface IWhiteboardNodePositionUpdate extends IGeneralWhiteboardNode {
  id: string;
  x: number;
  y: number;
}
