import {
  Simulation,
  forceCenter as d3ForceCenter,
  forceLink as d3ForceLink,
  forceSimulation as d3ForceSimulation,
} from 'd3-force';

import { EventEmitter } from '@angular/core';
import { Link } from './link';
import { Node } from './node';
import { rectCollide } from '../utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ForceDirectedGraph {
  private linkForceStrength = 1 / 80;

  public ticker: EventEmitter<Simulation<Node, Link>> = new EventEmitter();
  public simulation!: Simulation<any, any>;

  public nodes: Node[] = [];
  public links: Link[] = [];

  constructor(nodes: Node[], links: Link[], options: { width: number; height: number }) {
    this.nodes = nodes;
    this.links = links;

    this.initSimulation(options);
  }

  connectNodes(source: any, target: any) {
    if (!this.nodes[source] || !this.nodes[target]) {
      throw new Error('One of the nodes does not exist');
    }

    const link = new Link(source, target);
    this.simulation.stop();
    this.links.push(link);
    this.simulation.alphaTarget(0.3).restart();

    this.initLinks();
  }

  initNodes() {
    if (!this.simulation) {
      throw new Error('Simulation was not initialized yet');
    }

    this.simulation.nodes(this.nodes);
  }

  initLinks() {
    if (!this.simulation) {
      throw new Error('Simulation was not initialized yet');
    }

    this.simulation.force(
      'links',
      d3ForceLink(this.links)
        .id((data: any) => data['id'])
        .strength(this.linkForceStrength)
    );
  }

  initSimulation(options: { width: number; height: number }) {
    if (!options || !options.width || !options.height) {
      throw new Error('Missing options when initializing simulation');
    }

    const ticker = this.ticker;

    this.simulation = d3ForceSimulation().force('collision', rectCollide());

    // Connecting the d3 ticker to an angular event emitter
    this.simulation.on('tick', function () {
      ticker.emit(this);
    });

    this.initNodes();
    this.initLinks();

    // TODO: Activate this in a correct manner without breaking coordinates
    // Adjust center of the viewport while dragging elements
    // this.simulation.force('centers', d3ForceCenter(options.width / 2, options.height / 2));
    // this.simulation.restart();
  }
}
