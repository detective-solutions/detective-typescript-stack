import {
  AnyWhiteboardNode,
  IEmbeddingNode,
  ITableNode,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';
import { EmbeddingWhiteboardNode, TableWhiteboardNode } from '../models';

export function serializeWhiteboardNodes(nodes: AnyWhiteboardNode[]): AnyWhiteboardNode[] {
  nodes.map((node: AnyWhiteboardNode) => {
    switch (node.type) {
      case WhiteboardNodeType.TABLE: {
        return TableWhiteboardNode.Build(node as ITableNode);
      }
      case WhiteboardNodeType.EMBEDDING: {
        return EmbeddingWhiteboardNode.Build(node as IEmbeddingNode);
      }
      default: {
        throw new Error(`Could not serialize whiteboard node of type ${node?.type}`);
      }
    }
  });
  return nodes;
}
