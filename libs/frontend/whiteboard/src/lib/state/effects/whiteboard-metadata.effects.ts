import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Injectable } from '@angular/core';
import { WhiteboardMetadataActions } from '../actions';

@Injectable()
export class WhiteboardMetadataEffects {
  readonly updateWhiteboardTitle$ = createEffect(
    () => {
      return this.actions$.pipe(ofType());
    },
    { dispatch: false }
  );

  readonly updateWhiteboardDescription$ = createEffect(
    () => {
      return this.actions$.pipe(ofType());
    },
    { dispatch: false }
  );

  readonly whiteboardUserLeft$ = createEffect(
    () => {
      return this.actions$.pipe(ofType(WhiteboardMetadataActions.WhiteboardUserLeft));
    },
    { dispatch: false }
  );

  constructor(private readonly actions$: Actions) {}
}
