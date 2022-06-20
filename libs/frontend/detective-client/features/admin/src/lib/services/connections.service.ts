import { GetAllConnectionsGQL, IGetAllConnectionsGQLResponse } from '../graphql';
import { IConnectorPropertiesResponse, IConnectorTypesResponse, IGetAllConnectionsResponse } from '../models';
import { Observable, map } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { SourceConnection } from '@detective.solutions/frontend/shared/data-access';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class ConnectionsService {
  private static catalogBasePath = 'v1/catalog';

  private getAllConnectionsWatchQuery!: QueryRef<Response>;

  constructor(private readonly getAllConnectionsGQL: GetAllConnectionsGQL, private readonly httpClient: HttpClient) {}

  getAllConnections(paginationOffset: number, pageSize: number): Observable<IGetAllConnectionsResponse> {
    this.getAllConnectionsWatchQuery = this.getAllConnectionsGQL.watch({
      paginationOffset: paginationOffset,
      pageSize: pageSize,
    });
    return this.getAllConnectionsWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetAllConnectionsGQLResponse) => {
        return {
          connections: response.querySourceConnection.map(SourceConnection.Build),
          totalElementsCount: response.aggregateSourceConnection.count,
        };
      })
      //   catchError((error) => this.handleError(error))
    );
  }

  getAllConnectionsNextPage(paginationOffset: number, pageSize: number) {
    this.getAllConnectionsWatchQuery.fetchMore({
      variables: { paginationOffset: paginationOffset, pageSize: pageSize },
    });
    //   .catch((error) => this.handleError(error));
  }

  getAvailableConnectorTypes(): Observable<IConnectorTypesResponse[]> {
    return this.httpClient.get<IConnectorTypesResponse[]>(`${ConnectionsService.catalogBasePath}/connector/list`);
  }

  getConnectorProperties(connectorType: string): Observable<{ properties: IConnectorPropertiesResponse[] }> {
    return this.httpClient.get<{ properties: IConnectorPropertiesResponse[] }>(
      `${ConnectionsService.catalogBasePath}/connector/schema/${connectorType}`
    );
  }

  addConnection(connectionType: string, connectionName: string, payload: any) {
    return this.httpClient.post(
      `${ConnectionsService.catalogBasePath}/${connectionType}/insert/${connectionName}`,
      payload
    );
  }

  updateConnection(connectionType: string, connectionId: string, payload: any) {
    return this.httpClient.post(
      `${ConnectionsService.catalogBasePath}/${connectionType}/update/${connectionId}`,
      payload
    );
  }

  deleteConnection(connectionId: string, connectionName: string) {
    return this.httpClient.post(`${ConnectionsService.catalogBasePath}/delete`, {
      source_connection_xid: connectionId,
      source_connection_name: connectionName,
    });
  }

  // TODO: Enable when state is added to connections list
  //   private handleError(error: string) {
  //     this.tableCellEventService.resetLoadingStates$.next(true);
  //     return transformError(error);
  //   }
}
