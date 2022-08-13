import { AnyWhiteboardNode, ITableNodeTemporaryData } from '../../../models';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { IMessage, MessageEventType } from '@detective.solutions/shared/data-access';
import { filter, map, pluck, switchMap } from 'rxjs';

import { BaseNodeComponent } from '../base/base-node.component';
import { CustomLoadingOverlayComponent } from './components';
import { GridOptions } from 'ag-grid-community';
import { IQueryResponse as IQueryResponseBody } from './models';
import { TableNodeActions } from './state';
import { selectWhiteboardNodeById } from '../../../state';

@Component({
  selector: '[tableNode]',
  templateUrl: './table-node.component.html',
  styleUrls: ['./table-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableNodeComponent extends BaseNodeComponent implements OnInit {
  // Use this observable for column updates to correctly toggle the table loading screen
  readonly colDefUpdates$ = this.nodeTemporaryData$.pipe(
    filter((temporaryData: ITableNodeTemporaryData) => !!temporaryData?.colDefs && temporaryData?.colDefs.length >= 0),
    map((temporaryData: ITableNodeTemporaryData) => temporaryData.colDefs)
  );

  // Use this observable for row data updates to correctly toggle the table loading screen
  readonly rowDataUpdates$ = this.nodeTemporaryData$.pipe(
    filter((temporaryData: ITableNodeTemporaryData) => !!temporaryData?.rowData && temporaryData?.rowData?.length >= 0),
    map((temporaryData: ITableNodeTemporaryData) => temporaryData.rowData)
  );

  readonly gridOptions: GridOptions = {
    loadingOverlayComponent: CustomLoadingOverlayComponent,
    loadingOverlayComponentParams: { loadingMessage: 'Data is loading...' },
  };

  ngOnInit() {
    // Node update subscription needs to be defined here, otherwise this.id would be undefined
    this.subscriptions.add(
      this.store
        .select(selectWhiteboardNodeById(this.node.id))
        .pipe(filter(Boolean))
        .subscribe((updatedNode: AnyWhiteboardNode) => {
          // WARNING: It is not possible to simply reassign this.node reference when updating the node values
          // Currently the rendering will break due to some conflicts between HTML and SVG handling
          this.updateExistingNodeObject(updatedNode);
          this.nodeUpdates$.next(updatedNode);
        })
    );

    // Listen to QUERY_TABLE websocket message events
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) => webSocketSubject$.on$(MessageEventType.QueryTable)),
          filter((message: IMessage<IQueryResponseBody>) => message.context.nodeId === this.node.id),
          pluck('body')
        )
        .subscribe((messageData: IQueryResponseBody) => {
          this.store.dispatch(
            TableNodeActions.tableDataReceived({
              update: {
                id: this.node.id,
                changes: { temporary: { colDefs: messageData.tableSchema, rowData: messageData.tableData } },
              },
            })
          );
        })
    );
  }
}
