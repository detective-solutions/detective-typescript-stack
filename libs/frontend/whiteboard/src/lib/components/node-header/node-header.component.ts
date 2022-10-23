import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable, combineLatest, filter, map } from 'rxjs';

import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../services';
import { selectActiveUsers } from '../../state';

@Component({
  selector: 'node-header',
  templateUrl: './node-header.component.html',
  styleUrls: ['./node-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeHeaderComponent implements OnInit {
  @Input() title!: string;
  @Input() isBlocked$!: Observable<string>;

  blockInfo$!: Observable<Partial<IUserForWhiteboard>>;
  userName$!: Observable<string>;

  constructor(private readonly whiteboardFacade: WhiteboardFacadeService, private readonly store: Store) {}

  static getFullUserName(user: Partial<IUserForWhiteboard>) {
    return `${user.firstname} ${user.lastname}`;
  }

  ngOnInit() {
    // These observables have to be initialized in the OnInit hook,
    // to make sure that all required input values are available
    this.blockInfo$ = combineLatest([this.isBlocked$, this.store.select(selectActiveUsers)]).pipe(
      map(([userId, activeUsers]) => activeUsers.find((user: IUserForWhiteboard) => user.id === userId) ?? null),
      filter(Boolean)
    );
    this.userName$ = this.blockInfo$.pipe(map(NodeHeaderComponent.getFullUserName));
  }

  getUserInitialia(user: IUserForWhiteboard) {
    return (user.firstname.charAt(0) + user.lastname.charAt(0)).toUpperCase();
  }

  enableDragging() {
    this.whiteboardFacade.activateDragging();
  }
}
