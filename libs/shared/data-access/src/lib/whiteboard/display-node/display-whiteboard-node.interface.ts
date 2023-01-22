import { IDisplayNode } from './display-node.interface';
import { IForceDirectedNode } from '../d3';
import { IGeneralWhiteboardNode } from '../general-whiteboard-node.interface';

export type IDisplayWhiteboardNode = IDisplayNode & IGeneralWhiteboardNode & IForceDirectedNode;
