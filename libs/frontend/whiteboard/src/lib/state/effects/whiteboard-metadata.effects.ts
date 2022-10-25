import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IMessageContext, MessageEventType } from '@detective.solutions/shared/data-access';
import { combineLatest, of, switchMap, take, tap } from 'rxjs';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../services';
import { WhiteboardMetadataActions } from '../actions';
import { selectWhiteboardContextState } from '../selectors';

@Injectable()
export class WhiteboardMetadataEffects {
  readonly whiteboardUserLeft$ = createEffect(
    () => {
      return this.actions$.pipe(ofType(WhiteboardMetadataActions.WhiteboardUserLeft));
    },
    { dispatch: false }
  );

  readonly whiteboardTitleFocused$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardMetadataActions.WhiteboardTitleFocused),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        tap(([context, action]) => {
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.WhiteboardTitleFocused,
            data: {
              context: {
                ...context,
                eventType: MessageEventType.WhiteboardTitleFocused,
                userId: context.userId,
              } as IMessageContext,
              body: action.titleFocusedBy,
            },
          });
        })
      );
    },
    { dispatch: false }
  );

  readonly whiteboardTitleUpdated$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardMetadataActions.WhiteboardTitleUpdated),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        tap(([context, action]) => {
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.WhiteboardTitleUpdated,
            data: {
              context: {
                ...context,
                eventType: MessageEventType.WhiteboardTitleUpdated,
              } as IMessageContext,
              body: action.title,
            },
          });
        })
      );
    },
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly whiteboardFacade: WhiteboardFacadeService
  ) {}
}
