import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Injectable } from '@angular/core';

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

  constructor(private readonly actions$: Actions) {}
}
