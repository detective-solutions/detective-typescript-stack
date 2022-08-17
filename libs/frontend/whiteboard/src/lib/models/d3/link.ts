import { AnyWhiteboardNode, IForceDirectedLink } from '@detective.solutions/shared/data-access';

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
