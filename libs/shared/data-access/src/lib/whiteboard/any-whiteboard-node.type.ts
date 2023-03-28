import { IDisplayWhiteboardNode } from './display-node';
import { IEmbeddingWhiteboardNode } from './embedding-node';
import { ITableWhiteboardNode } from './table-node';

export type AnyWhiteboardNode = ITableWhiteboardNode | IEmbeddingWhiteboardNode | IDisplayWhiteboardNode;
