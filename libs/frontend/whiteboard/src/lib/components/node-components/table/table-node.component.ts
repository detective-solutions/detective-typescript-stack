import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { IMessage, MessageEventType } from '@detective.solutions/shared/data-access';
import { WhiteboardNodeActions, selectWhiteboardNodeById } from '../../../state';
import { filter, map, pluck, switchMap } from 'rxjs';

import { BaseNodeComponent } from '../base/base-node.component';
import { CustomLoadingOverlayComponent } from './components';
import { Node } from '../../../models';
import { TableNodeActions } from './state';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  selector: '[node]',
  templateUrl: './table-node.component.html',
  styleUrls: ['./table-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableNodeComponent extends BaseNodeComponent implements OnInit, AfterViewInit {
  // Use this observable for column updates to correctly toggle the table loading screen
  readonly colDefUpdates$ = this.nodeUpdates$.pipe(
    filter((node) => node?.colDefs.length !== 0),
    map((node: Node) => node.colDefs)
  );

  // Use this observable for row data updates to correctly toggle the table loading screen
  readonly rowDataUpdates$ = this.nodeUpdates$.pipe(
    filter((node) => node?.rowData.length !== 0),
    map((node: Node) => node.rowData)
  );

  readonly gridOptions: GridOptions = {
    loadingOverlayComponent: CustomLoadingOverlayComponent,
    loadingOverlayComponentParams: { loadingMessage: 'Data is loading...' },
  };

  ngOnInit() {
    // Node update subscription needs to be defined here, otherwise this.id would be undefined
    this.subscriptions.add(
      this.store.select(selectWhiteboardNodeById(this.node.id)).subscribe((updatedNode: Node) => {
        // WARNING: It is not possible to simply reassign this.node reference when updating the node values
        // Currently the rendering will break due to some conflicts between HTML and SVG handling
        this.updateExistingNodeObject(updatedNode);
        this.nodeUpdates$.next(updatedNode);
      })
    );

    this.subscriptions.add(
      this.nodeUpdates$.subscribe((node: Node) => {
        this.updateExistingNodeObject(node);
      })
    );

    // Listen to QUERY_TABLE websocket message events
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) => webSocketSubject$.on$(MessageEventType.QueryTable)),
          filter((message: IMessage<any>) => message.context.nodeId === this.node.id),
          pluck('body')
        )
        .subscribe((messageData: { tableSchema: (ColDef | ColGroupDef)[]; tableData: any[] }) => {
          this.store.dispatch(
            TableNodeActions.tableDataReceived({
              update: {
                id: this.node.id,
                changes: { colDefs: messageData.tableSchema, rowData: messageData.tableData },
              },
            })
          );
        })
    );
  }

  toggleLock() {
    this.store.dispatch(
      WhiteboardNodeActions.WhiteboardNodeUpdate({
        update: {
          id: this.node.id,
          changes: { locked: !this.node.locked },
        },
      })
    );
  }
}
