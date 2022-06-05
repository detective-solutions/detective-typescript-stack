import { INode, INodeInput } from './node.interface';

export class Node implements INode {
  static defaultWidth = 900;
  static defaultHeight = 500;

  fx!: number | null;
  fy!: number | null;

  constructor(
    public id = '',
    public type = '',
    public title = '',
    public locked = false,
    public x = 0,
    public y = 0,
    public width = Node.defaultWidth,
    public height = Node.defaultHeight
  ) {}

  static Build(nodeInput: INodeInput) {
    if (!nodeInput) {
      return new Node();
    }
    return new Node(
      nodeInput.id,
      nodeInput.type,
      nodeInput.title,
      nodeInput.locked,
      nodeInput.layout.x,
      nodeInput.layout.y,
      nodeInput.layout.width,
      nodeInput.layout.height
    );
  }
}
