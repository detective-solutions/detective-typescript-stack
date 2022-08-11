import { IEmbeddingNode } from './embedding-node.interface';
import { IForceDirectedNode } from '../../d3';
import { IGeneralWhiteboardNode } from '../general-whiteboard-node.interface';

export type IEmbeddingWhiteboardNode = IEmbeddingNode & IGeneralWhiteboardNode & IForceDirectedNode;
