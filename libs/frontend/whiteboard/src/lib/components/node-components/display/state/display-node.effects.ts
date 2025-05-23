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
                  filePageUrls: response.setup.pages,
                  expires: response.setup.exp,
                  entity: {
                    id: this.convertStringToUuid(response.xid),
                    pageCount: response.setup.pageCount,
                    baseQuery: response.setup.query,
                  },
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

  private convertStringToUuid(input: string) {
    return (
      input.substr(0, 8) +
      '-' +
      input.substr(8, 4) +
      '-' +
      input.substr(12, 4) +
      '-' +
      input.substr(16, 4) +
      '-' +
      input.substr(20)
    );
  }
}
