import { ComponentRef, Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { ForceDirectedGraph, Node, NodeComponent, NodeTypes } from '../models';

import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { TableNodeComponent } from '../components';

@Directive({
  selector: '[nodeGenerator]',
})
export class DynamicNodeGeneratorDirective implements OnInit {
  @Input() node!: Node;
  @Input() graph!: ForceDirectedGraph;

  constructor(private viewContainerRef: ViewContainerRef, private readonly logService: LogService) {}

  ngOnInit() {
    if (!this.node) {
      throw new Error('No node data provided. Cannot instantiate whiteboard component.');
    }
    this.viewContainerRef.clear();

    const componentRef = this.getComponentInstanceByType(this.node.type);
    if (componentRef) {
      componentRef.instance.node = this.node;
      componentRef.instance.graph = this.graph;
    }
  }

  getComponentInstanceByType(componentType: string): ComponentRef<NodeComponent> | null {
    switch (componentType) {
      case NodeTypes.TABLE: {
        return this.viewContainerRef.createComponent(TableNodeComponent);
      }
      default:
        this.logService.error(
          `Component type ${componentType} is not supported. Skipping whiteboard component initialization.`
        );
        return null;
    }
  }
}
