import { IEmbeddingNode, IEmbeddingNodeInput } from '../..';
import { Node } from '../../../../models';

export class EmbeddingNode extends Node implements IEmbeddingNode {
  constructor(
    public override id = '',
    public override type = '',
    public override title = '',
    public override locked = false,
    public override x = 0,
    public override y = 0,
    public override width = Node.defaultWidth,
    public override height = Node.defaultHeight,
    public href = '',
    public temporary = {}
  ) {
    super();
  }

  static override Build(nodeInput: IEmbeddingNodeInput) {
    if (!nodeInput) {
      return new EmbeddingNode();
    }
    return new EmbeddingNode(
      nodeInput.id,
      nodeInput.type,
      nodeInput.title,
      nodeInput.locked,
      nodeInput.layout.x,
      nodeInput.layout.y,
      nodeInput.layout.width,
      nodeInput.layout.height,
      nodeInput.href
    );
  }
}
