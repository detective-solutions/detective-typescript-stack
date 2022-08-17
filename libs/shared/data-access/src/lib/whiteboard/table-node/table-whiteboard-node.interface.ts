import { IForceDirectedNode } from '../d3';
import { IGeneralWhiteboardNode } from '../general-whiteboard-node.interface';
import { ITableNode } from './table-node.interface';

export type ITableWhiteboardNode = ITableNode & IGeneralWhiteboardNode & IForceDirectedNode;
