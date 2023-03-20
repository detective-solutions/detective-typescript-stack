import { Actions, createEffect, ofType } from '@ngrx/effects';
import { combineLatest, of, switchMap, take } from 'rxjs';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TableNodeActions } from '../actions';
import { selectWhiteboardContextState } from '../../../../../state';

@Injectable()
export class TableNodeEffects {
  readonly loadTableData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TableNodeActions.LoadTableData),
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
        //         query: ['SELECT * FROM freequery LIMIT 100'],
        //         tableId: ['59c9547a-dea7-11ec-ac54-287fcf6e439d'],
        //       } as IQueryMessagePayload,
        //     },
        //   })
        // )
      );
    },
    { dispatch: false }
  );

  constructor(private readonly actions$: Actions, private readonly store: Store) {}
}
