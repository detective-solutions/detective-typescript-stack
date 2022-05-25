import {
  Simulation,
  forceCenter as d3ForceCenter,
  forceLink as d3ForceLink,
  forceSimulation as d3ForceSimulation,
} from 'd3-force';

import { EventEmitter } from '@angular/core';
import { Link } from '../link';
import { Node } from '../node';
import { rectCollide } from '../../utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ForceDirectedGraph {
  ticker: EventEmitter<Simulation<Node, Link>> = new EventEmitter();
  simulation!: Simulation<any, any>;

  private nodes!: Node[];
  private links: Link[] = [];
  private options: { width: number; height: number };
  private readonly linkForceStrength = 1 / 80;

  constructor(options: { width: number; height: number }) {
    if (!options || !options.width || !options.height) {
      throw new Error('Missing options when initializing simulation');
    }
    this.options = options;

    const ticker = this.ticker; // Make ticker available in function context
    this.simulation = d3ForceSimulation().force('collision', rectCollide());
    // Connecting the d3 ticker to an angular event emitter
    this.simulation.on('tick', function () {
      ticker.emit(this);
    });
  }

  initialize(nodes: Node[]) {
    this.nodes = nodes;
    this.updateNodes();
    this.updateLinks();
  }

  connectNodes(source: any, target: any) {
    if (!this.nodes[source] || !this.nodes[target]) {
      throw new Error('One of the nodes does not exist');
    }
    const link = new Link(source, target);
    this.simulation.stop();
    this.links.push(link);
    this.simulation.alphaTarget(0.3).restart();
    this.updateLinks();
  }

  updateNodes() {
    if (!this.simulation) {
      throw new Error('Simulation was not initialized yet');
    }
    this.simulation.nodes(this.nodes);
    this.simulation.alphaTarget(1).restart();
  }

  updateLinks() {
    if (!this.simulation) {
      throw new Error('Simulation was not initialized yet');
    }

    this.simulation.force(
      'links',
      d3ForceLink(this.links)
        .id((data: any) => data['id'])
        .strength(this.linkForceStrength)
    );
    this.simulation.alphaTarget(1).restart();
  }

  addCenterForce() {
    // TODO: Allow elements to be dropped at the rights coordinates when center force is activated
    // Adjust center of the viewport while dragging elements
    this.simulation.force('centers', d3ForceCenter(this.options.width, this.options.height));
    this.simulation.restart();
  }

  removeCenterForce() {
    this.simulation.force('centers', null);
  }
}
