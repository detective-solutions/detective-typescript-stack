import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IMessageContext, MessageEventType } from '@detective.solutions/shared/data-access';
import { IQueryMessagePayload, QueryType } from '../../models';
import { combineLatest, of, switchMap, take, tap } from 'rxjs';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TableNodeActions } from '../actions';
import { WhiteboardFacadeService } from '../../../../../services/whiteboard-facade.service';
import { selectWhiteboardContextState } from '../../../../../state';

@Injectable()
export class TableNodeEffects {
  readonly loadTableData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TableNodeActions.LoadTableData),
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
                nodeId: action.node.id,
              } as IMessageContext,
              body: {
                queryType: QueryType.SqlQuery,
                query: [action.node.entity.baseQuery],
                tableId: [action.node.entity.id],
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
