import { Component, ElementRef, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { GetAllWhiteboardTablesGQL, IGetAllWhiteboardTablesGQLResponse } from '../../graphql';
import { Observable, Subscription, map } from 'rxjs';

import { MatMenuTrigger } from '@angular/material/menu';
import { QueryRef } from 'apollo-angular';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';
import { WhiteboardNodeType } from '@detective.solutions/shared/data-access';

@Component({
  selector: 'whiteboard-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent {
  @ViewChild('assetsMenuTrigger') assetsMenuTrigger!: MatMenuTrigger;
  @ViewChildren('tableOccurrence', { read: ElementRef }) tableOccurrence!: QueryList<ElementRef>;
  @ViewChild('embedding', { read: ElementRef }) embedding!: ElementRef;
  @ViewChild('assetsMenuIcon', { read: ElementRef }) assetsMenuIcon!: ElementRef;

  dataSources!: any[];

  isLoading = false;
  dataSourcesLoaded = false;

  private getAllConnectionsWatchQuery!: QueryRef<Response>;
  private readonly subscriptions = new Subscription();

  constructor(private readonly getAllSourceConnectionsGQL: GetAllWhiteboardTablesGQL) {}

  closeDataSourceMenu() {
    this.assetsMenuTrigger.closeMenu();
  }

  onDragStart(event: DragEvent) {
    const isTable = this.tableOccurrence.find((elementRef: ElementRef) => elementRef.nativeElement === event.target);
    if (isTable) {
      event.dataTransfer?.setDragImage(this.assetsMenuIcon.nativeElement, 0, 0);
      console.log(isTable.nativeElement.dataset);
      event.dataTransfer?.setData(
        'text/plain',
        JSON.stringify({
          type: WhiteboardNodeType.TABLE,
          entityId: isTable.nativeElement.dataset.entityId,
          title: isTable.nativeElement.dataset.name,
        })
      );
      return;
    }

    const isEmbedding = event.target === this.embedding.nativeElement;
    if (isEmbedding) {
      event.dataTransfer?.setData('text/plain', JSON.stringify({ type: WhiteboardNodeType.EMBEDDING }));
    }
  }

  onScroll(event: Event) {
    console.log(event);
  }

  getDataSources() {
    if (!this.dataSourcesLoaded) {
      this.isLoading = true;
      this.subscriptions.add(
        this.getAllSourceConnectionsGQL
          .fetch({ paginationOffset: 0, pageSize: 20 })
          .pipe(
            map((response: any) => response.data),
            map((response: IGetAllWhiteboardTablesGQLResponse) =>
              response.querySourceConnection.map(SourceConnectionDTO.Build)
            ),
            map((response: SourceConnectionDTO[]) =>
              response.filter((sourceConnection: SourceConnectionDTO) => sourceConnection.connectedTables.length > 0)
            ),
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
            })
          )
          .subscribe((response: object[]) => {
            this.isLoading = false;
            this.dataSources = response;
            this.dataSourcesLoaded = true;
          })
      );
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
