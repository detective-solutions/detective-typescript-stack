import { Actions, createEffect, ofType } from '@ngrx/effects';
import { filter, tap } from 'rxjs';

import { Injectable } from '@angular/core';
import { WhiteboardFacadeService } from '../../services';
import { WhiteboardNodeActions } from '../actions';

@Injectable()
export class WhiteboardNodeEffects {
  // Select added element if it was added manually
  readonly selectedManuallyAddedNodes$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(WhiteboardNodeActions.WhiteboardNodeAdded),
        filter((action) => action.addedManually),
        tap((action) => this.whiteboardFacade.whiteboardSelection$.next(action.addedNode.id))
      );
    },
    { dispatch: false }
  );

  constructor(private readonly actions$: Actions, private readonly whiteboardFacade: WhiteboardFacadeService) {}
}
