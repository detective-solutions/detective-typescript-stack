import { AnyWhiteboardNode } from './nodes';
import { IForceDirectedLink } from './d3/force-directed-link.interface';

export class Link implements IForceDirectedLink {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;

  source: AnyWhiteboardNode;
  target: AnyWhiteboardNode;

  constructor(source: AnyWhiteboardNode, target: AnyWhiteboardNode) {
    this.source = source;
    this.target = target;
  }
}
