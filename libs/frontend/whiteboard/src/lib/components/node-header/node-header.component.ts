import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { WhiteboardFacadeService } from '../../services';

@Component({
  selector: 'node-header',
  templateUrl: './node-header.component.html',
  styleUrls: ['./node-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeHeaderComponent {
  @Input() title!: string;

  constructor(private readonly whiteboardFacade: WhiteboardFacadeService) {}

  enableDragging() {
    this.whiteboardFacade.activateDragging();
  }
}
