import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable, filter, map, switchMap } from 'rxjs';

import { IUser } from '@detective.solutions/shared/data-access';
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

  blockInfo$!: Observable<Partial<IUser>>;
  userName$!: Observable<string>;

  constructor(private readonly whiteboardFacade: WhiteboardFacadeService) {}

  ngOnInit() {
    this.blockInfo$ = this.isBlocked$.pipe(
      filter(Boolean),
      switchMap((userId: string) => this.whiteboardFacade.getWhiteboardUserById(userId))
    );
    this.userName$ = this.blockInfo$.pipe(map((user: Partial<IUser>) => `${user.firstname} ${user.lastname}`));
  }

  enableDragging() {
    this.whiteboardFacade.activateDragging();
  }
}
