import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable, filter } from 'rxjs';

import { WhiteboardFacadeService } from '../../services';

@Component({
  selector: 'node-header',
  templateUrl: './node-header.component.html',
  styleUrls: ['./node-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeHeaderComponent implements OnInit {
  @Input() title!: string;
  @Input() isBlocked$!: Observable<string>;

  blockInfo$!: Observable<string>;

  constructor(private readonly whiteboardFacade: WhiteboardFacadeService) {}

  ngOnInit() {
    this.blockInfo$ = this.isBlocked$.pipe(filter(Boolean));
  }

  enableDragging() {
    this.whiteboardFacade.activateDragging();
  }
}
