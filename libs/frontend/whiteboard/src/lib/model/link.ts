import { Node } from './node';
import { SimulationLinkDatum } from 'd3-force';

export class Link implements SimulationLinkDatum<Node> {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;

  source: Node;
  target: Node;

  constructor(source: Node, target: Node) {
    this.source = source;
    this.target = target;
  }
}
