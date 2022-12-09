import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { IMessage, MessageEventType } from '@detective.solutions/shared/data-access';
import { BaseNodeComponent } from '../base/base-node.component';
import { filter, map, switchMap } from 'rxjs';
import { WhiteboardNodeActions } from '../../../state';

@Component({
  selector: '[displayNode]',
  templateUrl: './display-node.component.html',
  styleUrls: ['./display-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DisplayNodeComponent extends BaseNodeComponent implements OnInit {
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
          filter((message: IMessage<any>) => message.context.nodeId === this.node.id),
          map((message: IMessage<any>) => message?.body)
        )
        .subscribe((x) => console.log(x))
      /*
        .subscribe((messageData: IQueryResponseBody) => {
          this.store.dispatch(
            DisplayNodeActions.TableDataReceived({
              update: {
                id: this.node.id,
                changes: { temporary: { colDefs: messageData.tableSchema, rowData: messageData.tableData } },
              },
            })
          );
        })*/
    );

    // const isTemporaryTableDataAvailable =
    //   !(this.node as ITableNode).temporary?.colDefs || !(this.node as ITableNode).temporary?.rowData;
    // if (isTemporaryTableDataAvailable) {
    //   // It is mandatory to create a deep copy of the node object, because it will be set to read-only
    //   // when it is handled by the state mechanism
    //   this.store.dispatch(TableNodeActions.LoadTableData({ node: { ...(this.node as ITableWhiteboardNode) } }));
    // }
  }
}
