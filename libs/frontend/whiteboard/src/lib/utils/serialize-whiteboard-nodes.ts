import { AnyWhiteboardNode, ICachedCasefileForWhiteboard } from '@detective.solutions/shared/data-access';
import { EmbeddingWhiteboardNode, TableWhiteboardNode } from '../models';

export function serializeWhiteboardNodes(casefile: ICachedCasefileForWhiteboard): AnyWhiteboardNode[] {
  let nodes: AnyWhiteboardNode[] = [];
  if (casefile.tables) {
    nodes = nodes.concat(casefile.tables.map(TableWhiteboardNode.Build));
  }
  if (casefile.embeddings) {
    nodes = nodes.concat(casefile.embeddings.map(EmbeddingWhiteboardNode.Build));
  }
  return nodes;
}
