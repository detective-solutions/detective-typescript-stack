import { ComponentRef, Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { Node, WhiteboardComponent } from '../model';

import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { WhiteboardTableComponent } from '../components';

@Directive({
  selector: '[whiteboardElement]',
})
export class DynamicWhiteboardComponentsDirective implements OnInit {
  @Input() node!: Node;

  constructor(private viewContainerRef: ViewContainerRef, private readonly logService: LogService) {}

  ngOnInit() {
    if (!this.node) {
      throw new Error('No node data provided. Cannot instantiate whiteboard component.');
    }
    this.viewContainerRef.clear();

    // TODO: Use type property from node object here
    const componentRef = this.getComponentInstanceByType('table');
    if (componentRef) {
      componentRef.instance.node = this.node;
    }
  }

  getComponentInstanceByType(componentType: string): ComponentRef<WhiteboardComponent> | null {
    switch (componentType) {
      // TODO: use enum here
      case 'table': {
        return this.viewContainerRef.createComponent(WhiteboardTableComponent);
      }
      default:
        this.logService.error(
          `Component type ${componentType} is not supported. Skipping whiteboard component initialization.`
        );
        return null;
    }
  }
}
