import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WhiteboardService } from '../../services';

@Component({
  selector: 'whiteboard-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  constructor(private readonly whiteboardService: WhiteboardService) {}

  addNode() {
    this.whiteboardService.addElement();
  }
}
