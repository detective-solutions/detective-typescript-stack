import { Component, HostListener, Input } from '@angular/core';

import { Node } from '../../../model';

@Component({
  selector: 'table-element',
  template: `
    <svg:g class="node" [attr.transform]="'translate(' + node.x + ',' + node.y + ')'">
      <foreignObject width="1000" height="500">
        <div class="element-header" fxFlex fxLayoutAlign="space-between center">
            <input placeholder="Insert title here">
            <mat-icon fxLayoutAlign="center center" class="drag-indicator">
                drag_indicator
            </mat-icon>
        </div>
        <div class="drag-overlay"></div>
      </foreignObject>
    </svg:g>
  `,
  styleUrls: ['./table.component.scss'],
})
export class TableComponent {
  @Input() node!: Node;

  showHalo = false;

  @HostListener('mousedown', ['$event'])
  onClick() {
    this.showHalo = true;
  }
}
