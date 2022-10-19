import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IMessageContext, MessageEventType } from '@detective.solutions/shared/data-access';
import { combineLatest, of, switchMap, take, tap } from 'rxjs';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../services';
import { WhiteboardGeneralActions } from '../actions';
import { selectWhiteboardContextState } from '../selectors';

@Injectable()
export class WhiteboardGeneralEffects {
  readonly loadWhiteboardData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardGeneralActions.LoadWhiteboardData),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        tap(([context, _action]) => {
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.LoadWhiteboardData,
            data: {
              context: { ...context, eventType: MessageEventType.LoadWhiteboardData } as IMessageContext,
              body: {},
            },
          });
        })
      );
    },
    { dispatch: false }
  );

  readonly cursorMoved$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardGeneralActions.WhiteboardCursorMoved),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        tap(([context, action]) => {
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.WhiteboardCursorMoved,
            data: {
              context: { ...context, eventType: MessageEventType.WhiteboardCursorMoved } as IMessageContext,
              body: { x: action.x, y: action.y },
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
