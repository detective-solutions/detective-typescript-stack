import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { GetAllWhiteboardTablesGQL, IGetAllWhiteboardTablesGQLResponse } from '../../graphql';
import { Observable, map, tap } from 'rxjs';

import { QueryRef } from 'apollo-angular';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';
import { WhiteboardNodeType } from '@detective.solutions/shared/data-access';

@Component({
  selector: 'whiteboard-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent implements OnInit {
  @ViewChildren('tableOccurrence', { read: ElementRef }) tableOccurrence!: QueryList<ElementRef>;
  @ViewChild('embedding', { read: ElementRef }) embedding!: ElementRef;
  @ViewChild('dataSourceMenuIcon', { read: ElementRef }) dataSourceMenuIcon!: ElementRef;

  dataSources$!: Observable<any[]>;

  private getAllConnectionsWatchQuery!: QueryRef<Response>;

  constructor(private readonly getAllSourceConnectionsGQL: GetAllWhiteboardTablesGQL) {}

  ngOnInit() {
    this.dataSources$ = this.getAllConnections(0, 1000).pipe(
      map((response: SourceConnectionDTO[]) => {
        const connectedTables = response.map((sourceConnection: SourceConnectionDTO) => {
          return sourceConnection.connectedTables.map((connectedTable: any) => {
            return {
              ...connectedTable,
              iconSrc: sourceConnection.iconSrc,
            };
          });
        });
        return connectedTables.flat();
      }),
      tap(console.log)
    );
  }

  onMenuOpened() {
    console.log('YO');
  }

  onDragStart(event: DragEvent) {
    const isTable = this.tableOccurrence.find((elementRef: ElementRef) => elementRef.nativeElement === event.target);
    if (isTable) {
      event.dataTransfer?.setDragImage(this.dataSourceMenuIcon.nativeElement, 0, 0);
      event.dataTransfer?.setData(
        'text/plain',
        JSON.stringify({ type: WhiteboardNodeType.TABLE, entityId: isTable.nativeElement.id })
      );
      return;
    }

    const isEmbedding = event.target === this.embedding.nativeElement;
    if (isEmbedding) {
      event.dataTransfer?.setData('text/plain', JSON.stringify({ type: WhiteboardNodeType.EMBEDDING }));
    }
  }

  getAllConnections(paginationOffset: number, pageSize: number): Observable<SourceConnectionDTO[]> {
    if (!this.getAllConnectionsWatchQuery) {
      this.getAllConnectionsWatchQuery = this.getAllSourceConnectionsGQL.watch(
        {
          paginationOffset: paginationOffset,
          pageSize: pageSize,
        },
        { pollInterval: 10000 }
      );
    }

    return this.getAllConnectionsWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetAllWhiteboardTablesGQLResponse) =>
        response.querySourceConnection.map(SourceConnectionDTO.Build)
      ),
      map((response: SourceConnectionDTO[]) =>
        response.filter((sourceConnection: SourceConnectionDTO) => sourceConnection.connectedTables.length > 0)
      )
    );
  }
}
