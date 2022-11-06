import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: '[node-selection-halo]',
  templateUrl: './node-selection-halo.component.html',
  styleUrls: ['./node-selection-halo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeSelectionHaloComponent {
  @Input() nodeId!: string;
  @Input() nodeWidth!: number;
  @Input() nodeHeight!: number;

  readonly haloHandleRadius = 10;
  readonly haloOffset = 4;
}
