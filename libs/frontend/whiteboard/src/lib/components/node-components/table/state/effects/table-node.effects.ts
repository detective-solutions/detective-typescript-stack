import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Injectable } from '@angular/core';
import { TableEvents } from '../../model';
import { TableNodeActions } from '../actions/table-node-action.types';
import { WhiteboardFacadeService } from '../../../../../services';
import { tap } from 'rxjs';

@Injectable()
export class TableNodeEffects {
  readonly loadTableData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TableNodeActions.tableNodeAdded),
        tap((action) => this.whiteboardFacade.addElementToWhiteboard(action.tableElementAdded)),
        tap((action) => {
          // Select added element if it was added manually
          if (action.addedManually) {
            this.whiteboardFacade.whiteboardSelection$.next(action.tableElementAdded.id);
          }
        }),
        tap(() =>
          // TODO: Get this data from node
          this.whiteboardFacade.sendWebsocketMessage({
            event: TableEvents.QueryTable,
            data: {
              context: {
                tenantId: '1',
                casefileId: '2',
                userId: '3',
                userRole: 'ADMIN',
                nodeId: 'node',
                timestamp: '',
              },
              body: {
                case: '90d404c5-9d20-11ec-83f2-287fc999439d',
                query_type: 'general',
                query: ['SELECT emp_no, first_name, last_name FROM employees LIMIT 100'],
                source: ['99o404c5-9d20-11ec-83f2-287fcf6e439d'],
                groups: ['4e45ac4b-9d18-11ec-8804-287fcf6e439d'],
              },
            },
          })
        )
      );
    },
    { dispatch: false }
  );

  constructor(private readonly actions$: Actions, private readonly whiteboardFacade: WhiteboardFacadeService) {}
}
