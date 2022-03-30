import { Component, HostListener, Input } from '@angular/core';

import { Node } from '../../model';

@Component({
  selector: '[nodeVisual]',
  template: `
    <svg:g class="node" [attr.transform]="'translate(' + node.x + ',' + node.y + ')'">
      <foreignObject width="1000" height="500">
        <div class="element-header" fxFlex fxLayoutAlign="space-between center"><input placeholder="Insert title here"><mat-icon fxLayoutAlign="center center" class="drag-indicator">drag_indicator</mat-icon></div>
        <div class="drag-overlay"></div>
        <iframe src="http://detective.solutions" style="height:inherit;width:inherit;"></iframe>
      </foreignObject>
      <svg:circle *ngIf="showHalo" class="node-circle" [attr.fill]="node.color" cx="0" cy="0" r="10"></svg:circle>
      <svg:text class="node-name">
        {{ node.id }}
      </svg:text> -->
    </svg:g>
  `,
  styleUrls: ['./test-node.component.scss'],
})
export class TestNodeComponent {
  @Input('nodeVisual') node!: Node;

  showHalo = false;

  @HostListener('mousedown', ['$event'])
  onClick() {
    this.showHalo = true;
  }
}
