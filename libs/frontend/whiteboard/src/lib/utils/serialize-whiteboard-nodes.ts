import { AnyWhiteboardNode, EmbeddingWhiteboardNode, TableWhiteboardNode } from '../models';

import { ICasefileForWhiteboard } from '@detective.solutions/shared/data-access';

export function serializeWhiteboardNodes(casefile: ICasefileForWhiteboard): AnyWhiteboardNode[] {
  let nodes: AnyWhiteboardNode[] = [];
  if (casefile.tables) {
    nodes = nodes.concat(casefile.tables.map(TableWhiteboardNode.Build));
  }
  if (casefile.embeddings) {
    nodes = nodes.concat(casefile.embeddings.map(EmbeddingWhiteboardNode.Build));
  }
  return nodes;
}
