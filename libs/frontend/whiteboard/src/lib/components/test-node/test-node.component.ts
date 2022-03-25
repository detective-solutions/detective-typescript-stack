import { Component, Input } from '@angular/core';

import { Node } from '../../model';

@Component({
  selector: '[nodeVisual]',
  template: `
    <svg:g class="node" [attr.transform]="'translate(' + node.x + ',' + node.y + ')'">
      <svg:circle class="node-circle" [attr.fill]="node.color" cx="0" cy="0" [attr.r]="node.r"></svg:circle>
      <svg:text class="node-name">
        {{ node.id }}
      </svg:text>
    </svg:g>
  `,
  styleUrls: ['./test-node.component.scss'],
})
export class TestNodeComponent {
  @Input('nodeVisual') node!: Node;
}
