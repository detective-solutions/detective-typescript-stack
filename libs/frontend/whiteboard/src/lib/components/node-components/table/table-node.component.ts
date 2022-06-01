import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { map, tap } from 'rxjs';

import { BaseNodeComponent } from '../base/base-node.component';
import { CustomLoadingOverlayComponent } from './components';
import { GridOptions } from 'ag-grid-community';
import { ITableNode } from './model';
import { TableNodeActions } from './state';
import { Update } from '@ngrx/entity';
import { WhiteboardActions } from '../../../state/actions';
import { ofType } from '@ngrx/effects';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  selector: '[node]',
  templateUrl: './table-node.component.html',
  styleUrls: ['./table-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableNodeComponent extends BaseNodeComponent implements OnInit, AfterViewInit {
  readonly gridOptions: GridOptions = {
    loadingOverlayComponent: CustomLoadingOverlayComponent,
    loadingOverlayComponentParams: { loadingMessage: 'Data is loading...' },
  };

  readonly incomingWebsocketMessages$ = this.whiteboardFacade.webSocket$;

  readonly getTableDataFromStore$ = this.actions$.pipe(
    ofType(TableNodeActions.tableDataReceived),
    map((data) => data.update.changes)
  );

  readonly columnDefs$ = this.getTableDataFromStore$.pipe(
    tap(console.log),
    map((data) => data.colDefs)
  );

  readonly rowData$ = this.getTableDataFromStore$.pipe(
    tap(console.log),
    map((data) => data.rowData)
  );

  ngOnInit() {
    this.subscriptions.add(
      // TODO: Add event keys to Kafka messages
      this.incomingWebsocketMessages$
        // .pipe(
        // filter((message: WebsocketMessage<any>) => message.event === TableEvents.QueryTable),
        // map((message: WebsocketMessage<ITableNodeDataInput>) => message.data)
        // )
        // TODO: Set correct type for incoming data
        .subscribe((messageData: any) => {
          const update: Update<ITableNode> = {
            id: this.node.id,
            changes: { colDefs: messageData.schema, rowData: messageData.data },
          };
          this.store.dispatch(TableNodeActions.tableDataReceived({ update: update }));
        })
    );
  }

  toggleLock() {
    this.store.dispatch(
      WhiteboardActions.WhiteboardNodeUpdate({
        update: {
          id: this.node.id,
          changes: { locked: !this.node.locked },
        },
      })
    );
  }
}
