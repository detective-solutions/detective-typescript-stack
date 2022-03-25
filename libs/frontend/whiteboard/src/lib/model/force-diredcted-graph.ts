import {
  Simulation,
  forceCenter as d3ForceCenter,
  forceCollide as d3ForceCollide,
  forceLink as d3ForceLink,
  forceManyBody as d3ForceManyBody,
  forceSimulation as d3ForceSimulation,
} from 'd3-force';

import { EventEmitter } from '@angular/core';
import { Link } from './link';
import { Node } from './node';

/* eslint-disable @typescript-eslint/no-explicit-any */

const FORCES = {
  LINKS: 1 / 50,
  COLLISION: 1,
  CHARGE: -1,
};

export class ForceDirectedGraph {
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
        .strength(FORCES.LINKS)
    );
  }

  initSimulation(options: { width: number; height: number }) {
    if (!options || !options.width || !options.height) {
      throw new Error('Missing options when initializing simulation');
    }

    const ticker = this.ticker;

    this.simulation = d3ForceSimulation()
      .force(
        'charge',
        d3ForceManyBody().strength((data: any) => FORCES.CHARGE * data['r'])
      )
      .force(
        'collide',
        d3ForceCollide()
          .strength(FORCES.COLLISION)
          .radius((data: any) => data['r'] + 10)
          .iterations(2)
      );

    // Connecting the d3 ticker to an angular event emitter
    this.simulation.on('tick', function () {
      ticker.emit(this);
    });

    this.initNodes();
    this.initLinks();

    /** Updating the central force of the simulation */
    this.simulation.force('centers', d3ForceCenter(options.width / 2, options.height / 2));

    /** Restarting the simulation internal timer */
    this.simulation.restart();
  }
}
