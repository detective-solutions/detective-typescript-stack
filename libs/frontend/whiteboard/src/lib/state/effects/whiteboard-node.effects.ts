import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  IMessageContext,
  IWhiteboardNodePropertiesUpdate,
  MessageEventType,
} from '@detective.solutions/shared/data-access';
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
                nodeId: action.deletedNodeId,
              } as IMessageContext,
              body: null,
            },
          })
        )
      );
    },
    { dispatch: false }
  );

  readonly whiteboardNodePropertiesUpdated$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.WhiteboardNodePropertiesUpdated),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        tap(([context, action]) => {
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.WhiteboardNodePropertiesUpdated,
            data: {
              context: {
                ...context,
                eventType: MessageEventType.WhiteboardNodePropertiesUpdated,
                userId: context.userId,
              } as IMessageContext,
              // Convert ngRx Update type to plain node list for backend
              body: action.updates.map((update: Update<IWhiteboardNodePropertiesUpdate>) => {
                return { nodeId: update.id, ...update.changes };
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
