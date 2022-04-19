import { Component, Input } from '@angular/core';

@Component({
  selector: '[node-selection-halo]',
  templateUrl: './node-selection-halo.component.html',
  styleUrls: ['./node-selection-halo.component.scss'],
})
export class NodeSelectionHaloComponent {
  @Input() nodeWidth!: number;
  @Input() nodeHeight!: number;

  readonly haloHandleRadius = 6;
  readonly haloOffset = 4;
  readonly haloColor = '#fc1767';
}
