import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ForceDirectedGraph, Link, Node } from '../../model';

import { D3Service } from '../../services/d3.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'whiteboard-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostComponent implements OnInit {
  dummyNodes = [new Node('0'), new Node('1'), new Node('2'), new Node('3')];
  dummyLinks = [new Link(this.dummyNodes[1], this.dummyNodes[3]), new Link(this.dummyNodes[1], this.dummyNodes[2])];

  graph!: ForceDirectedGraph;

  options = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  subscriptions = new Subscription();
  nodeNodesIndex = 4;

  constructor(private readonly d3Service: D3Service, private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.graph = this.d3Service.getForceDirectedGraph(this.dummyNodes, this.dummyLinks, this.options);

    // Bind change detection to each graph tick to improve performance
    this.subscriptions.add(
      this.graph.ticker.subscribe(() => {
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  increaseNodes() {
    this.dummyNodes.push(new Node(String(this.nodeNodesIndex)));
    ++this.nodeNodesIndex;
    this.graph.initNodes();
    this.graph.initLinks();
  }
}
