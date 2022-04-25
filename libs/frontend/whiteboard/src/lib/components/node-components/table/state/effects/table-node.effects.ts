import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Injectable } from '@angular/core';
import { TableEvents } from '../../model';
import { TableNodeActions } from '../actions/table-node-action.types';
import { WhiteboardService } from '../../../../../services';
import { tap } from 'rxjs';

@Injectable()
export class TableNodeEffects {
  readonly loadTableData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(TableNodeActions.tableNodeAdded),
        tap((action) => this.whiteboardService.addElementToWhiteboard(action.tableElementAdded)),
        tap((action) =>
          this.whiteboardService.sendWebsocketMessage({
            event: TableEvents.QueryTable,
            data: action.tableElementAdded.id,
          })
        )
      );
    },
    { dispatch: false }
  );

  constructor(private readonly actions$: Actions, private readonly whiteboardService: WhiteboardService) {}
}
