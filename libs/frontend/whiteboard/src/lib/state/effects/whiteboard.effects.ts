import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Injectable } from '@angular/core';
import { WhiteboardActions } from '../actions/action.types';
import { WhiteboardService } from '../../services';
import { tap } from 'rxjs';

@Injectable()
export class WhiteboardEffects {
  loadTableData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardActions.tableNodeAdded),
        tap((action) => this.whiteboardService.addElementToWhiteboard(action.tableElementAdded)),
        tap((action) => this.whiteboardService.getTableData(action.tableElementAdded.id))
      );
    },
    { dispatch: false }
  );

  constructor(private readonly actions$: Actions, private readonly whiteboardService: WhiteboardService) {}
}
