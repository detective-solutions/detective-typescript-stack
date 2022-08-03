import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IMessageContext, MessageEventType } from '@detective.solutions/shared/data-access';
import { combineLatest, filter, of, switchMap, take, tap } from 'rxjs';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../services';
import { WhiteboardNodeActions } from '../actions';
import { selectWhiteboardContextState } from '../selectors';

@Injectable()
export class WhiteboardNodeEffects {
  // Select added element if it was added manually
  readonly selectedManuallyAddedNodes$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.WhiteboardNodeAdded),
        filter((action) => action.addedManually),
        tap((action) => this.whiteboardFacade.whiteboardSelection$.next(action.addedNode.id))
      );
    },
    { dispatch: false }
  );

  readonly loadWhiteboardData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.loadWhiteboardData),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        tap(([context, _action]) => {
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.LoadWhiteboardData,
            // TODO: Investigate how to handle empty node ids
            data: { context: { nodeId: '', ...context } as IMessageContext, body: {} },
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
