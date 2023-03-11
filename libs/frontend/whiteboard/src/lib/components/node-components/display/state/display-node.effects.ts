import { Actions, createEffect, ofType } from '@ngrx/effects';
import { combineLatest, of, switchMap, take, tap } from 'rxjs';

import { Injectable } from '@angular/core';
import { LoadDisplayFiles } from './display-node.actions';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../../../services';
import { WhiteboardNodePropertiesUpdated } from '../../../../state/actions/whiteboard-node.actions';
import { WhiteboardNodeType } from '@detective.solutions/shared/data-access';

@Injectable()
export class DisplayNodeEffects {
  readonly loadDisplayFiles$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(LoadDisplayFiles),
        switchMap((action) =>
          combineLatest([this.whiteboardFacade.uploadFile(action.file).pipe(take(1)), of(action).pipe(take(1))])
        ),
        tap(([response, action]) => {
          WhiteboardNodePropertiesUpdated({
            updates: [
              {
                id: action.nodeId,
                changes: {
                  type:
                    response.nodeType.valueOf() === 'Display' ? WhiteboardNodeType.DISPLAY : WhiteboardNodeType.TABLE,
                  totalPageCount: response.setup.pageCount,
                  pages: response.setup.pages,
                  expires: response.setup.exp,
                },
              },
            ],
          });
        })
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
