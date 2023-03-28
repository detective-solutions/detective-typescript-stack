import { Component, ViewEncapsulation } from '@angular/core';
import {
  IMessage,
  ITableNode,
  ITableNodeTemporaryData,
  ITableWhiteboardNode,
  MessageEventType,
} from '@detective.solutions/shared/data-access';
import { LoadTableData, TableDataReceived } from './state';
import { filter, map, switchMap } from 'rxjs';

import { BaseNodeComponent } from '../base/base-node.component';
import { CustomLoadingOverlayComponent } from './components';
import { GridOptions } from 'ag-grid-community';
import { IQueryResponse as IQueryResponseBody } from './models';
import { WhiteboardNodeActions } from '../../../state';

@Component({
  selector: '[tableNode]',
  templateUrl: './table-node.component.html',
  styleUrls: ['./table-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableNodeComponent extends BaseNodeComponent {
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

  get entityId(): string {
    return (this.node as ITableWhiteboardNode).entity.id ?? '';
  }

  get baseQuery(): string {
    return (this.node as ITableWhiteboardNode).entity.baseQuery ?? '';
  }

  protected override customOnInit() {
    this.subscriptions.add(
      this.nodeTitleBlur$.subscribe((updatedTitle: string) =>
        this.store.dispatch(
          WhiteboardNodeActions.WhiteboardNodePropertiesUpdated({
            updates: [{ id: this.node.id, changes: { title: updatedTitle } }],
          })
        )
      )
    );

    // Listen to QUERY_TABLE websocket message events
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) => webSocketSubject$.on$(MessageEventType.QueryTable)),
          filter((message: IMessage<IQueryResponseBody>) => message.context.nodeId === this.node.id),
          map((message: IMessage<IQueryResponseBody>) => message?.body)
        )
        .subscribe((messageData: IQueryResponseBody) => {
          this.store.dispatch(
            TableDataReceived({
              update: {
                id: this.node.id,
                changes: { temporary: { colDefs: messageData.tableSchema, rowData: messageData.tableData } },
              },
            })
          );
        })
    );

    const isTemporaryTableDataAvailable =
      (this.node as ITableNode).temporary?.colDefs || (this.node as ITableNode).temporary?.rowData;
    if (!isTemporaryTableDataAvailable) {
      // It is mandatory to create a deep copy of the node object, because it will be set to read-only
      // when it is handled by the state mechanism
      this.store.dispatch(LoadTableData({ node: { ...(this.node as ITableWhiteboardNode) } }));
    }
  }
}
