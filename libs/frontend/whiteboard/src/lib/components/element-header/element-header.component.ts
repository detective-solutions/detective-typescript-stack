import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DragService } from '../../services';

@Component({
  selector: 'element-header',
  templateUrl: './element-header.component.html',
  styleUrls: ['./element-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElementHeaderComponent {
  constructor(private readonly dragService: DragService) {}

  enableDragging() {
    this.dragService.activateDragging();
  }
}
