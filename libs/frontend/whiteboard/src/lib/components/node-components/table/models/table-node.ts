import { ITableNode } from './table-node.interface';
import { ITableNodeInput } from './table-node-input.interface';
import { Node } from '../../../../models';

export class TableNode extends Node implements ITableNode {
  constructor(
    public override id = '',
    public override type = '',
    public override title = '',
    public override locked = false,
    public override x = 0,
    public override y = 0,
    public override width = Node.defaultWidth,
    public override height = Node.defaultHeight,
    public temporary = {}
  ) {
    super();
  }

  static override Build(nodeInput: ITableNodeInput) {
    if (!nodeInput) {
      return new TableNode();
    }
    return new TableNode(
      nodeInput.id,
      nodeInput.type,
      nodeInput.title,
      nodeInput.locked,
      nodeInput.layout.x,
      nodeInput.layout.y,
      nodeInput.layout.width,
      nodeInput.layout.height,
      nodeInput.temporary
    );
  }
}
