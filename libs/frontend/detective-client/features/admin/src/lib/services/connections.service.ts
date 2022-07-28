import {
  GetAllConnectionsGQL,
  GetConnectionByIdGQL,
  IGetAllConnectionsGQLResponse,
  IGetConnectionByIdGQLResponse,
} from '../graphql';
import {
  IConnectorPropertiesResponse,
  IConnectorSchemaResponse,
  IConnectorTypesResponse,
  IGetAllConnectionsResponse,
  IGetConnectionByIdResponse,
} from '../models';
import { Observable, catchError, map } from 'rxjs';
import { QueryRef, gql } from 'apollo-angular';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SourceConnection } from '@detective.solutions/frontend/shared/data-access';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';
import { environment } from '@detective.solutions/frontend/shared/environments';
import { transformError } from '@detective.solutions/frontend/shared/error-handling';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class ConnectionsService {
  private static catalogBasePath = `${environment.baseApiPath}${environment.catalogApiPathV1}`;

  private getConnectionByIdWatchQuery!: QueryRef<Response>;
  private getAllConnectionsWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getConnectionByIdGQL: GetConnectionByIdGQL,
    private readonly getAllConnectionsGQL: GetAllConnectionsGQL,
    private readonly httpClient: HttpClient,
    private readonly tableCellEventService: TableCellEventService
  ) {}

  getConnectionById(id: string): Observable<IGetConnectionByIdResponse> {
    this.getConnectionByIdWatchQuery = this.getConnectionByIdGQL.watch({ id: id });
    return this.getConnectionByIdWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetConnectionByIdGQLResponse) => response.getSourceConnection)
    );
  }

  getAllConnections(paginationOffset: number, pageSize: number): Observable<IGetAllConnectionsResponse> {
    this.getAllConnectionsWatchQuery = this.getAllConnectionsGQL.watch({
      paginationOffset: paginationOffset,
      pageSize: pageSize,
    });

    const subscriptionGQL = gql`
      subscription onConnectionChanged {
        querySourceConnection {
          xid
          name
          description
          connectorName
          status
        }
      }
    `;

    this.getAllConnectionsWatchQuery.subscribeToMore({
      document: subscriptionGQL,
      updateQuery: (prev, { subscription }) =>
        subscription && subscription.data ? { ...prev, querySourceConnection: subscription.data } : prev,
    });

    return this.getAllConnectionsWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetAllConnectionsGQLResponse) => {
        return {
          connections: response.querySourceConnection.map(SourceConnection.Build),
          totalElementsCount: response.aggregateSourceConnection.count,
        };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getAllConnectionsNextPage(paginationOffset: number, pageSize: number) {
    this.getAllConnectionsWatchQuery
      .fetchMore({
        variables: { paginationOffset: paginationOffset, pageSize: pageSize },
      })
      .catch((error) => this.handleError(error));
  }

  getAvailableConnectorTypes(): Observable<IConnectorTypesResponse[]> {
    return this.httpClient.get<IConnectorTypesResponse[]>(`${ConnectionsService.catalogBasePath}/connector/list`);
  }

  getConnectorProperties(connectorType: string): Observable<{ properties: IConnectorPropertiesResponse[] }> {
    return this.httpClient.get<{ properties: IConnectorPropertiesResponse[] }>(
      `${ConnectionsService.catalogBasePath}/connector/schema/${connectorType}`
    );
  }

  getExistingConnectorPropertiesById(connectionId: string): Observable<IConnectorSchemaResponse> {
    return this.httpClient.get<IConnectorSchemaResponse>(
      `${ConnectionsService.catalogBasePath}/schema/${connectionId}`
    );
  }

  addConnection(connectionType: string, payload: any) {
    return this.httpClient.post(`${ConnectionsService.catalogBasePath}/${connectionType}/insert`, payload);
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

  private handleError(error: string) {
    this.tableCellEventService.resetLoadingStates$.next(true);
    return transformError(error);
  }
}
