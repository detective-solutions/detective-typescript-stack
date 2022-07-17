import { AbstractNode, AbstractNodeInput, NodeType } from '../models';
import { EmbeddingNode, IEmbeddingNodeInput, ITableNodeInput, TableNode } from '../components';

export function serializeNodeForWhiteboard(nodeInput: AbstractNodeInput): AbstractNode {
  switch (nodeInput.type) {
    case NodeType.TABLE: {
      return TableNode.Build(nodeInput as ITableNodeInput);
    }
    case NodeType.EMBEDDING: {
      return EmbeddingNode.Build(nodeInput as IEmbeddingNodeInput);
    }
    default: {
      throw new Error(`Could not serialize node information for node type ${nodeInput.type}`);
    }
  }
}
