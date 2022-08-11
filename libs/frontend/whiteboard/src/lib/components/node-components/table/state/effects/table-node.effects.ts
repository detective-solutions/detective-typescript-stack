import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IMessageContext, MessageEventType } from '@detective.solutions/shared/data-access';
import { IQueryMessagePayload, QueryType } from '../../models';
import { WhiteboardNodeActions, selectWhiteboardContextState } from '../../../../../state';
import { combineLatest, filter, of, switchMap, take, tap } from 'rxjs';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../../../../services';
import { WhiteboardNodeType } from '../../../../../models';

@Injectable()
export class TableNodeEffects {
  readonly loadTableData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.WhiteboardNodeAdded),
        filter((action) => action.addedNode.type === WhiteboardNodeType.TABLE),
        switchMap((action) =>
          combineLatest([this.store.select(selectWhiteboardContextState).pipe(take(1)), of(action).pipe(take(1))])
        ),
        tap(([context, action]) =>
          this.whiteboardFacade.sendWebsocketMessage({
            event: MessageEventType.QueryTable,
            data: {
              context: {
                ...context,
                eventType: MessageEventType.QueryTable,
                nodeId: action.addedNode.id,
              } as IMessageContext,
              body: {
                queryType: QueryType.SqlQuery,
                query: ['SELECT * FROM freequery LIMIT 100'], // TODO: Fetch query/table info from node object
                tableId: ['59c9547a-dea7-11ec-ac54-287fcf6e439d'],
                groupId: ['68c127fc-dea7-11ec-8d94-287fcf6e439d'], // TODO: Can be removed after backend adjustments
              } as IQueryMessagePayload,
            },
          })
        )
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
