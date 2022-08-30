import { AnyWhiteboardNode, IForceDirectedNode, WhiteboardOptions } from '@detective.solutions/shared/data-access';
import { Simulation, forceCenter as d3ForceCenter, forceSimulation as d3ForceSimulation } from 'd3-force';

import { EventEmitter } from '@angular/core';
import { Link } from './link';
import { quadtree as d3Quadtree } from 'd3-quadtree';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ForceDirectedGraph {
  private static readonly forceCollisionPadding = 85;

  private nodes: AnyWhiteboardNode[] = [];
  private options: { width: number; height: number };
  // private readonly linkForceStrength = 1 / 80;

  readonly ticker$: EventEmitter<Simulation<IForceDirectedNode, Link>> = new EventEmitter();
  readonly nodePositionUpdatedByForce$: EventEmitter<AnyWhiteboardNode> = new EventEmitter();

  simulation!: Simulation<any, any>;

  constructor(options: WhiteboardOptions) {
    if (!options || !options.width || !options.height) {
      throw new Error('Missing options when initializing simulation');
    }
    this.options = options;

    this.simulation = d3ForceSimulation().force(
      'collision',
      this.rectCollide((nodeWithUpdatedPosition: AnyWhiteboardNode) =>
        this.nodePositionUpdatedByForce$.emit(nodeWithUpdatedPosition)
      )
    );

    // Make ticker available in callback function context
    const ticker = this.ticker$;
    // Connect d3 ticker to an Angular event emitter
    this.simulation.on('tick', function () {
      ticker.emit(this);
    });

    // this.addCenterForce();
  }

  updateNodes(nodes: AnyWhiteboardNode[]) {
    if (!this.simulation) {
      throw new Error('Simulation was not initialized yet');
    }
    this.nodes = nodes;
    this.simulation.nodes(this.nodes);
    this.simulation.alphaTarget(0.1).restart();
  }

  // TODO: Reactivate when implementing links
  // private updateLinks() {
  //   if (!this.simulation) {
  //     throw new Error('Simulation was not initialized yet');
  //   }
  //   this.simulation.force(
  //     'links',
  //     d3ForceLink(this.links)
  //       .id((data: any) => data['id'])
  //       .strength(this.linkForceStrength)
  //   );
  //   this.simulation.alphaTarget(1).restart();
  // }

  // connectNodes(source: any, target: any) {
  //   if (!this.nodes[source] || !this.nodes[target]) {
  //     throw new Error('One of the nodes does not exist');
  //   }
  //   const link = new Link(source, target);
  //   this.simulation.stop();
  //   this.links.push(link);
  //   this.simulation.alpha(0.01).restart();
  //   this.updateLinks();
  // }

  // TODO: Allow elements to be dropped at the rights coordinates when center force is activated
  private addCenterForce() {
    // Adjust center of the viewport while dragging elements
    this.simulation.force('centers', d3ForceCenter(this.options.width, this.options.height));
    this.simulation.restart();
  }

  private removeCenterForce() {
    this.simulation.force('centers', null);
  }

  private rectCollide(nodePositionCallback: (nodeWithUpdatedPosition: AnyWhiteboardNode) => void) {
    let nodes: AnyWhiteboardNode[];

    function force() {
      const quadTree = d3Quadtree(
        nodes,
        (d: any) => d.x,
        (d: any) => d.y
      );
      for (const node of nodes) {
        if (node.locked) {
          continue;
        }

        quadTree.visit((q: any) => {
          let updated = false;

          if (q.data && q.data !== node) {
            let x = node.x - q.data.x;
            let y = node.y - q.data.y;
            let l, lx, ly;

            const xSpacing = ForceDirectedGraph.forceCollisionPadding + (q.data.width + node.width) / 2;
            const ySpacing = ForceDirectedGraph.forceCollisionPadding + (q.data.height + node.height) / 2;
            const absX = Math.abs(x);
            const absY = Math.abs(y);

            if (absX < xSpacing && absY < ySpacing) {
              l = Math.sqrt(x * x + y * y);

              lx = (absX - xSpacing) / l;
              ly = (absY - ySpacing) / l;

              if (Math.abs(lx) > Math.abs(ly)) {
                lx = 0;
              } else {
                ly = 0;
              }
              const prevX = node.x;
              const prevY = node.y;

              // Round node position to reduce data
              node.x -= Math.round((x *= lx / 2));
              node.y -= Math.round((y *= ly / 2));

              // Only update node if position differs
              // Otherwise updates will be send on every tick
              if (prevX !== node.x || prevY !== node.y) {
                updated = true;
                nodePositionCallback(node);
              }
            }
          }
          return updated;
        });
      }
    }
    force.initialize = (_nodes: AnyWhiteboardNode[]) => (nodes = _nodes);
    return force;
  }
}
