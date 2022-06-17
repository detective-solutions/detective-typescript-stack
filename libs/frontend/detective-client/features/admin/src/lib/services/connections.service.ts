import { GetAllConnectionsGQL, IGetAllConnectionsGQLResponse } from '../graphql';
import { IConnectorTypesResponse, IGetAllConnectionsResponse } from '../interfaces';
import { Observable, map, pluck } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { SourceConnection } from '@detective.solutions/frontend/shared/data-access';

@Injectable()
export class ConnectionsService {
  private getAllConnectionsWatchQuery!: QueryRef<Response>;

  constructor(private readonly getAllConnectionsGQL: GetAllConnectionsGQL, private readonly httpClient: HttpClient) {}

  getAllConnections(paginationOffset: number, pageSize: number): Observable<IGetAllConnectionsResponse> {
    this.getAllConnectionsWatchQuery = this.getAllConnectionsGQL.watch({
      paginationOffset: paginationOffset,
      pageSize: pageSize,
    });
    return this.getAllConnectionsWatchQuery.valueChanges.pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  getAvailableConnectorTypes(): Observable<string[]> {
    return this.httpClient.get<IConnectorTypesResponse>('v1/catalog/connector/list').pipe(pluck('types'));
  }

  getConnectorProperties(connectorType: string) {
    return this.httpClient.get(`v1/catalog/connector/schema/${connectorType}`);
  }

  // TODO: Enable when state is added to connections list
  //   private handleError(error: string) {
  //     this.tableCellEventService.resetLoadingStates$.next(true);
  //     return transformError(error);
  //   }
}
