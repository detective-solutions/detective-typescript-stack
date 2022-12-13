import { Actions, createEffect, ofType } from '@ngrx/effects';
import { combineLatest, of, switchMap, take } from 'rxjs';

import { DisplayNodeActions } from '../actions';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../../../../services';
import { selectWhiteboardContextState } from '../../../../../state';

@Injectable()
export class DisplayNodeEffects {
  readonly loadDisplayFiles$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DisplayNodeActions.loadDisplayFiles),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        )
        // tap(([context, action]) =>
        //   this.whiteboardFacade.sendWebsocketMessage({
        //     event: MessageEventType.QueryTable,
        //     data: {
        //       context: {
        //         ...context,
        //         eventType: MessageEventType.QueryTable,
        //         nodeId: action.node.id,
        //       } as IMessageContext,
        //       body: {
        //         queryType: QueryType.SqlQuery,
        //         query: ['SELECT * FROM freequery LIMIT 100'], // TODO: Fetch query/table info from node object
        //         tableId: ['59c9547a-dea7-11ec-ac54-287fcf6e439d'],
        //         groupId: ['68c127fc-dea7-11ec-8d94-287fcf6e439d'], // TODO: Can be removed after backend adjustments
        //       } as IQueryMessagePayload,
        //     },
        //   })
        // )
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
