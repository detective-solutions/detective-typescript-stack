import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  AnyWhiteboardNode,
  IMessageContext,
  IWhiteboardNodeBlockUpdate,
  IWhiteboardNodePositionUpdate,
  MessageEventType,
} from '@detective.solutions/shared/data-access';
import { WhiteboardGeneralActions, WhiteboardNodeActions } from '../actions';
import { combineLatest, filter, of, switchMap, take, tap } from 'rxjs';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { WhiteboardFacadeService } from '../../services';
import { selectWhiteboardContextState } from '../selectors';

@Injectable()
export class WhiteboardNodeEffects {
  // Select added element if it was added manually
  readonly selectedManuallyAddedNodes$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardGeneralActions.WhiteboardNodeAdded),
        filter((action) => action.addedManually),
        tap((action) => this.whiteboardFacade.whiteboardSelection$.next(action.addedNode.id))
      );
    },
    { dispatch: false }
  );

  readonly whiteboardNodeBlocked$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.WhiteboardNodeBlocked),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        tap(([context, action]) => {
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.WhiteboardNodeBlocked,
            data: {
              context: {
                ...context,
                eventType: MessageEventType.WhiteboardNodeBlocked,
                nodeId: action.update.id,
                userId: context.userId,
              } as IMessageContext,
              body: {
                temporary: { blockedBy: action.update.changes.temporary?.blockedBy },
              } as IWhiteboardNodeBlockUpdate,
            },
          });
        })
      );
    },
    { dispatch: false }
  );

  readonly whiteboardNodeUnBlocked$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.WhiteboardNodeUnblocked),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        tap(([context, action]) => {
          // Use WHITEBOARD_NODE_BLOCKED event type with null value to be handled by the backend
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.WhiteboardNodeBlocked,
            data: {
              context: {
                ...context,
                eventType: MessageEventType.WhiteboardNodeBlocked,
                nodeId: action.update.id,
                userId: context.userId,
              } as IMessageContext,
              body: {
                temporary: { blockedBy: null },
              } as IWhiteboardNodeBlockUpdate,
            },
          });
        })
      );
    },
    { dispatch: false }
  );

  readonly whiteboardNodesMoved$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.WhiteboardNodesMoved),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        tap(([context, action]) => {
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.WhiteboardNodeMoved,
            data: {
              context: {
                ...context,
                eventType: MessageEventType.WhiteboardNodeMoved,
                userId: context.userId,
              } as IMessageContext,
              // Convert ngRx Update type to plain node list for backend
              body: action.updates.map((update: Update<AnyWhiteboardNode>) => {
                return {
                  id: update.id,
                  x: update.changes.x,
                  y: update.changes.y,
                  type: update.changes.type,
                } as IWhiteboardNodePositionUpdate;
              }),
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
