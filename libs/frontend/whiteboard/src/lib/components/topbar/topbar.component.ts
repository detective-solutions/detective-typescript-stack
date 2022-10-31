import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap, take } from 'rxjs';
import {
  WhiteboardMetadataActions,
  selectActiveUsers,
  selectIsWhiteboardTitleFocusedByDifferentUserId,
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
  isTitleFocusedByDifferentUser$ = this.store
    .select(selectWhiteboardContextState)
    .pipe(
      switchMap((context: IWhiteboardContextState) =>
        this.store.select(selectIsWhiteboardTitleFocusedByDifferentUserId(context.userId))
      )
    );
  activeUsers$ = this.store.select(selectActiveUsers);

  private readonly titleInputDebounceTime = 600;

  constructor(private readonly store: Store) {}

  ngOnInit() {
    this.titleInput$
      .pipe(debounceTime(this.titleInputDebounceTime), filter(Boolean), distinctUntilChanged())
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
        this.store.dispatch(WhiteboardMetadataActions.WhiteboardTitleFocused({ titleFocusedBy: context.userId }))
      );
  }

  onTitleInputBlur() {
    // Add timeout to be in sync with debounced value update in the titleInput$ observable
    setTimeout(
      () => this.store.dispatch(WhiteboardMetadataActions.WhiteboardTitleFocused({ titleFocusedBy: null })),
      this.titleInputDebounceTime
    );
  }

  getUserFullName(user: IUserForWhiteboard) {
    return `${user.firstname} ${user.lastname}`;
  }

  getUserInitialia(user: IUserForWhiteboard) {
    return (user.firstname.charAt(0) + user.lastname.charAt(0)).toUpperCase();
  }
}
