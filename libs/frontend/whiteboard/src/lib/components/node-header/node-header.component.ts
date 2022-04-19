import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DragService } from '../../services';

@Component({
  selector: 'node-header',
  templateUrl: './node-header.component.html',
  styleUrls: ['./node-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeHeaderComponent {
  @Input() title!: string;

  constructor(private readonly dragService: DragService) {}

  enableDragging() {
    this.dragService.activateDragging();
  }
}
