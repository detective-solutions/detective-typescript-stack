import { ChangeDetectionStrategy, Component } from '@angular/core';
import { selectActiveUsers, selectWhiteboardTitle } from '../../state';

import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';
import { Store } from '@ngrx/store';

@Component({
  selector: 'whiteboard-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  title$ = this.store.select(selectWhiteboardTitle);
  activeUsers$ = this.store.select(selectActiveUsers);

  constructor(private readonly store: Store) {}

  getUserFullName(user: IUserForWhiteboard) {
    return `${user.firstname} ${user.lastname}`;
  }

  getUserInitialia(user: IUserForWhiteboard) {
    return (user.firstname.charAt(0) + user.lastname.charAt(0)).toUpperCase();
  }
}
