import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { ForceDirectedGraph, Node } from '../model';

import { D3Service } from '../services/d3.service';

@Directive({
  selector: '[draggableNode]',
})
export class DraggableDirective implements OnInit {
  @Input() draggableNode!: Node;
  @Input() draggableInGraph!: ForceDirectedGraph;

  constructor(private readonly d3Service: D3Service, private readonly element: ElementRef) {}

  ngOnInit() {
    this.d3Service.applyDragBehavior(this.element.nativeElement, this.draggableNode, this.draggableInGraph);
  }
}
