import {
  GetAllConnectionsGQL,
  GetTablesBySourceConnectionIdGQL,
  IGetAllConnectionsGQLResponse,
  IGetTablesBySourceConnectionIdGQLResponse,
} from '../graphql';
import {
  IConnectionsAddEditResponse,
  IConnectionsDeleteResponse,
  IConnectorPropertiesResponse,
  IConnectorSchemaResponse,
  IConnectorTypesResponse,
  IGetAllConnectionsResponse,
} from '../models';
import { ISourceConnectionTables, SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';
import { LogService, transformError } from '@detective.solutions/frontend/shared/error-handling';
import { Observable, catchError, map } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';
import { environment } from '@detective.solutions/frontend/shared/environments';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class ConnectionsService {
  private static catalogServiceBasePath = `${environment.baseApiPath}${environment.catalogApiPathV1}`;

  private getAllConnectionsWatchQuery!: QueryRef<Response>;
  private getAllTablesWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getAllConnectionsGQL: GetAllConnectionsGQL,
    private readonly getTablesBySourceConnectionIdGQL: GetTablesBySourceConnectionIdGQL,
    private readonly httpClient: HttpClient,
    private readonly tableCellEventService: TableCellEventService,
    private readonly logger: LogService
  ) {}

  getTablesOfConnection(id: string): Observable<ISourceConnectionTables> {
    this.getAllTablesWatchQuery = this.getTablesBySourceConnectionIdGQL.watch({ id: id });
    return this.getAllTablesWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetTablesBySourceConnectionIdGQLResponse) => response.getSourceConnection)
    );
  }

  getAllConnections(paginationOffset: number, pageSize: number): Observable<IGetAllConnectionsResponse> {
    if (!this.getAllConnectionsWatchQuery) {
      this.getAllConnectionsWatchQuery = this.getAllConnectionsGQL.watch(
        {
          paginationOffset: paginationOffset,
          pageSize: pageSize,
        },
        { pollInterval: 10000 }
      );
    }

    return this.getAllConnectionsWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetAllConnectionsGQLResponse) => {
        return {
          connections: response.querySourceConnection.map(SourceConnectionDTO.Build),
          totalElementsCount: response.aggregateSourceConnection.count,
        };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  refreshConnections() {
    const currentResult = this.getAllConnectionsWatchQuery.getCurrentResult()?.data as any;
    const alreadyLoadedConnectionCount = (currentResult as IGetAllConnectionsGQLResponse)?.querySourceConnection
      ?.length;
    if (alreadyLoadedConnectionCount) {
      this.getAllConnectionsWatchQuery.refetch({ paginationOffset: 0, pageSize: alreadyLoadedConnectionCount });
    } else {
      this.logger.error('Could not determine currently loaded connection count. Reusing values of last query...');
      this.getAllConnectionsWatchQuery.refetch();
    }
  }

  getAvailableConnectorTypes(): Observable<IConnectorTypesResponse[]> {
    return this.httpClient.get<IConnectorTypesResponse[]>(
      `${ConnectionsService.catalogServiceBasePath}/connector/list`
    );
  }

  getConnectorProperties(connectorType: string): Observable<{ properties: IConnectorPropertiesResponse[] }> {
    return this.httpClient.get<{ properties: IConnectorPropertiesResponse[] }>(
      `${ConnectionsService.catalogServiceBasePath}/connector/schema/${connectorType}`
    );
  }

  getExistingConnectorPropertiesById(connectionId: string): Observable<IConnectorSchemaResponse> {
    return this.httpClient.get<IConnectorSchemaResponse>(
      `${ConnectionsService.catalogServiceBasePath}/schema/${connectionId}`
    );
  }

  addConnection(connectionType: string, payload: any): Observable<IConnectionsAddEditResponse> {
    return this.httpClient.post<IConnectionsAddEditResponse>(
      `${ConnectionsService.catalogServiceBasePath}/${connectionType}/insert`,
      payload
    );
  }

  updateConnection(
    connectionType: string,
    connectionId: string,
    payload: any
  ): Observable<IConnectionsAddEditResponse> {
    return this.httpClient.post<IConnectionsAddEditResponse>(
      `${ConnectionsService.catalogServiceBasePath}/${connectionType}/update/${connectionId}`,
      payload
    );
  }

  deleteConnection(connection: SourceConnectionDTO): Observable<IConnectionsDeleteResponse> {
    console.log(connection);
    return this.httpClient.post<IConnectionsDeleteResponse>(`${ConnectionsService.catalogServiceBasePath}/delete`, {
      source_connection_xid: connection.id,
      source_connection_name: connection.name,
    });
  }

  private handleError(error: string): Observable<never> {
    this.tableCellEventService.resetLoadingStates$.next(true);
    return transformError(error);
  }
}
