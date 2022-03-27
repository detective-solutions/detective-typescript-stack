import { ForceDirectedGraph, Link, Node } from '../model';
import { Subscription, of } from 'rxjs';

import { D3Service } from './d3.service';
import { Injectable } from '@angular/core';

@Injectable()
export class WhiteboardService {
  constructor(private readonly d3Service: D3Service) {}
  options = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  graph!: ForceDirectedGraph;
  rootSVGElement!: SVGElement | null;

  nodes = [new Node('0'), new Node('1'), new Node('2'), new Node('3')];
  nodes$ = of(this.nodes);

  links = [new Link(this.nodes[1], this.nodes[3]), new Link(this.nodes[1], this.nodes[2])];
  links$ = of(this.links);

  subscriptions = new Subscription();

  nodeNodesIndex = 4;

  addElement() {
    this.getWhiteboardRootElement();

    const node = new Node(String(this.nodeNodesIndex));
    node.x = Math.floor(Math.random() * 1000);
    node.y = Math.floor(Math.random() * 1000);
    this.nodes.push(node);
    ++this.nodeNodesIndex;
    this.graph.initNodes();
    this.graph.initLinks();
  }

  getForceDirectedGraph() {
    this.graph = this.d3Service.getForceDirectedGraph(this.nodes, this.links, this.options);
    return this.graph;
  }

  private getWhiteboardRootElement() {
    if (!this.rootSVGElement) {
      this.rootSVGElement = document.querySelector('#whiteboard g');
      if (!this.rootSVGElement) {
        throw new Error(`${this.constructor.name} could not reference whiteboard DOM element.`);
      }
    }
  }
}
