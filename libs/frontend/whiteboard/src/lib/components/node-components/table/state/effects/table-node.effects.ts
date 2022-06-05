import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IQueryMessagePayload, QueryType, TableEvents } from '../../model';
import { WhiteboardNodeActions, selectWhiteboardContextState } from '../../../../../state';
import { combineLatest, filter, of, switchMap, tap } from 'rxjs';

import { IMessageContext } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';
import { NodeType } from '../../../../../models';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../../../../services';

@Injectable()
export class TableNodeEffects {
  readonly loadTableData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.WhiteboardNodeAdded),
        filter((action) => action.addedNode.type === NodeType.TABLE),
        switchMap((action) => combineLatest([this.store.select(selectWhiteboardContextState), of(action)])),
        tap(([context, action]) =>
          this.whiteboardFacade.sendWebsocketMessage({
            event: TableEvents.QueryTable,
            data: {
              context: { nodeId: action.addedNode.id, ...context } as IMessageContext,
              body: {
                query_type: QueryType.SqlQuery,
                query: 'SELECT * FROM employees LIMIT 100', // TODO: Fetch query/table info from node object
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
