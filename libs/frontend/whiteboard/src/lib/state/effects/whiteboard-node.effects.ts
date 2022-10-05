import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AnyWhiteboardNode, IMessageContext, MessageEventType } from '@detective.solutions/shared/data-access';
import { combineLatest, filter, of, switchMap, take, tap } from 'rxjs';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { WhiteboardFacadeService } from '../../services';
import { WhiteboardNodeActions } from '../actions';
import { selectWhiteboardContextState } from '../selectors';

@Injectable()
export class WhiteboardNodeEffects {
  readonly whiteboardNodeAdded$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.WhiteboardNodeAdded),
        filter((action) => action?.addedManually), // Only handle manually added nodes to prevent infinite loop
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        tap(([context, action]) =>
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.WhiteboardNodeAdded,
            data: {
              context: {
                ...context,
                eventType: MessageEventType.WhiteboardNodeAdded,
                userId: context.userId,
                nodeId: action.addedNode.id,
              } as IMessageContext,
              body: action.addedNode,
            },
          })
        )
      );
    },
    { dispatch: false }
  );

  // Select added element if it was added manually
  readonly selectedManuallyAddedNodes$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.WhiteboardNodeAdded),
        filter((action) => action.addedManually),
        switchMap((action) =>
          combineLatest([of(action).pipe(take(1)), this.store.select(selectWhiteboardContextState).pipe(take(1))])
        ),
        tap(([action, context]) => this.whiteboardFacade.addSelectedNode(action.addedNode.id, context.userId))
      );
    },
    { dispatch: false }
  );

  readonly whiteboardNodeDeleted$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.WhiteboardNodeDeleted),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        tap(([context, action]) =>
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.WhiteboardNodeDeleted,
            data: {
              context: {
                ...context,
                eventType: MessageEventType.WhiteboardNodeDeleted,
                userId: context.userId,
                nodeId: action.deletedNode.id,
              } as IMessageContext,
              body: null,
            },
          })
        )
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
                userId: context.userId,
                nodeId: action.update.id,
              } as IMessageContext,
              body: {
                temporary: { blockedBy: action.update.changes.temporary?.blockedBy },
              },
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
              },
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
        ofType(WhiteboardNodeActions.WhiteboardNodesPositionUpdated),
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
                };
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
