import { IForceDirectedLink } from './d3/force-directed-link.interface';
import { Node } from './node';

export class Link implements IForceDirectedLink {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;

  source: Node;
  target: Node;

  constructor(source: Node, target: Node) {
    this.source = source;
    this.target = target;
  }
}
