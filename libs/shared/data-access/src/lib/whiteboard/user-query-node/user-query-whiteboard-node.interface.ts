import { IForceDirectedNode } from '../d3';
import { IGeneralWhiteboardNode } from '../general-whiteboard-node.interface';
import { IUserQueryNode } from './user-query-node.interface';

export type IUserQueryWhiteboardNode = IUserQueryNode & IGeneralWhiteboardNode & IForceDirectedNode;
