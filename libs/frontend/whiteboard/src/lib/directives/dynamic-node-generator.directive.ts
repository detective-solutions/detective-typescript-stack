import { ComponentRef, Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { Node, NodeComponent, NodeType } from '../models';

import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { TableNodeComponent } from '../components';

@Directive({
  selector: '[nodeGenerator]',
})
export class DynamicNodeGeneratorDirective implements OnInit {
  @Input() node!: Node;

  constructor(private viewContainerRef: ViewContainerRef, private readonly logService: LogService) {}

  ngOnInit() {
    if (!this.node) {
      throw new Error('No node data provided. Cannot instantiate whiteboard component.');
    }
    this.viewContainerRef.clear();

    const componentRef = this.getComponentInstanceByType(this.node.type);
    if (componentRef) {
      componentRef.instance.node = this.node;
    }
  }

  getComponentInstanceByType(componentType: string): ComponentRef<NodeComponent> | null {
    switch (componentType) {
      case NodeType.TABLE: {
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
