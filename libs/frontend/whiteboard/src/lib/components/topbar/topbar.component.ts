import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, filter, take } from 'rxjs';
import {
  WhiteboardMetadataActions,
  selectActiveUsers,
  selectIsWhiteboardTitleFocused,
  selectWhiteboardContextState,
  selectWhiteboardTitle,
} from '../../state';

import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';
import { IWhiteboardContextState } from '../../state/interfaces';
import { Store } from '@ngrx/store';

@Component({
  selector: 'whiteboard-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent implements OnInit {
  title$ = this.store.select(selectWhiteboardTitle);
  titleInput$ = new Subject<string>();
  isTitleFocused$ = this.store.select(selectIsWhiteboardTitleFocused);
  activeUsers$ = this.store.select(selectActiveUsers);

  constructor(private readonly store: Store) {}

  ngOnInit() {
    this.titleInput$
      .pipe(debounceTime(600), filter(Boolean), distinctUntilChanged())
      .subscribe((title: string) => this.store.dispatch(WhiteboardMetadataActions.WhiteboardTitleUpdated({ title })));
  }

  onTitleInputChange(event: KeyboardEvent) {
    this.titleInput$.next((event.target as HTMLInputElement).value);
  }

  onTitleInputFocus() {
    this.store
      .select(selectWhiteboardContextState)
      .pipe(take(1))
      .subscribe((context: IWhiteboardContextState) =>
        this.store.dispatch(WhiteboardMetadataActions.WhiteboardTitleFocused({ titleFocusedBy: context.userRole }))
      );
  }

  onTitleInputBlur() {
    this.store.dispatch(WhiteboardMetadataActions.WhiteboardTitleFocused({ titleFocusedBy: null }));
  }

  getUserFullName(user: IUserForWhiteboard) {
    return `${user.firstname} ${user.lastname}`;
  }

  getUserInitialia(user: IUserForWhiteboard) {
    return (user.firstname.charAt(0) + user.lastname.charAt(0)).toUpperCase();
  }
}
