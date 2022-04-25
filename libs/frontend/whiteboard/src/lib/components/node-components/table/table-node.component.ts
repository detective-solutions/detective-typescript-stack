import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ITableNode, ITableNodeDataInput, TableEvents } from './model';
import { TableNodeActions, selectTableNodesFromStore } from './state';
import { filter, map } from 'rxjs';

import { BaseNodeComponent } from '../base/base-node.component';
import { CustomLoadingOverlayComponent } from './components';
import { GridOptions } from 'ag-grid-community';
import { Update } from '@ngrx/entity';
import { WebsocketMessage } from '../../../models';
import { select } from '@ngrx/store';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  selector: '[node]',
  templateUrl: './table-node.component.html',
  styleUrls: ['./table-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableNodeComponent extends BaseNodeComponent implements OnInit {
  gridOptions: GridOptions = {
    loadingOverlayComponent: CustomLoadingOverlayComponent,
    loadingOverlayComponentParams: { loadingMessage: 'Data is loading...' },
  };

  // Observable for all incoming messages addressed to a certain instance of this component
  readonly incomingWebsocketMessages$ = this.websocketService.websocketSubject$.pipe(
    filter((message: WebsocketMessage<any>) => message.data?.id === this.node.id)
  );

  readonly getTableDataFromStore$ = this.store.pipe(
    select(selectTableNodesFromStore),
    filter((entities: any) => this.node && entities[this.node.id]),
    map((entities: any) => entities[this.node.id])
  );
  readonly columnDefs$ = this.getTableDataFromStore$.pipe(map((data) => data.colDefs));
  readonly rowData$ = this.getTableDataFromStore$.pipe(map((data) => data.rowData));

  override ngOnInit() {
    this.initBaseNode();
    this.subscriptions.add(
      this.incomingWebsocketMessages$
        .pipe(
          filter((message: WebsocketMessage<any>) => message.event === TableEvents.QueryTable),
          map((message: WebsocketMessage<ITableNodeDataInput>) => message.data)
        )
        .subscribe((messageData: ITableNodeDataInput) => {
          const update: Update<ITableNode> = {
            id: messageData.id,
            changes: { colDefs: messageData.colDefs, rowData: messageData.rowData },
          };
          this.store.dispatch(TableNodeActions.tableDataReceived({ update: update }));
        })
    );
  }
}
