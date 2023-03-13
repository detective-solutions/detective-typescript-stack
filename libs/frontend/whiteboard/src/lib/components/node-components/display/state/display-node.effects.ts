import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DisplayNodeDataReceived, LoadDisplayNodeData } from './display-node.actions';
import { exhaustMap, map } from 'rxjs';

import { IUploadResponse } from '../../../../models';
import { Injectable } from '@angular/core';
import { WhiteboardFacadeService } from '../../../../services';
import { WhiteboardNodePropertiesUpdated } from '../../../../state/actions/whiteboard-node.actions';
import { WhiteboardNodeType } from '@detective.solutions/shared/data-access';

@Injectable()
export class DisplayNodeEffects {
  readonly loadDisplayFiles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LoadDisplayNodeData),
      exhaustMap((action) =>
        this.whiteboardFacade.uploadFile(action.file).pipe(
          map((response: IUploadResponse) =>
            DisplayNodeDataReceived({
              update: {
                id: action.nodeId,
                changes: {
                  type:
                    response.nodeType.valueOf() === 'Display' ? WhiteboardNodeType.DISPLAY : WhiteboardNodeType.TABLE,
                  pageCount: response.setup.pageCount,
                  filePageUrls: response.setup.pages,
                  expires: response.setup.exp,
                },
              },
            })
          )
        )
      )
    );
  });

  readonly loadDisplayFilesSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DisplayNodeDataReceived),
      map((action) => WhiteboardNodePropertiesUpdated({ updates: [action.update] }))
    );
  });

  constructor(private readonly actions$: Actions, private readonly whiteboardFacade: WhiteboardFacadeService) {}
}
