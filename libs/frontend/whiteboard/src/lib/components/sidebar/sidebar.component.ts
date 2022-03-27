import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'whiteboard-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {}
