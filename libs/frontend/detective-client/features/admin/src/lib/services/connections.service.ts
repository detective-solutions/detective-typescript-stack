import { GetAllConnectionsGQL, IGetAllConnectionsGQLResponse } from '../graphql';
import { Observable, catchError, map } from 'rxjs';

import { DataSource } from '@detective.solutions/frontend/shared/data-access';
import { IGetAllConnectionsResponse } from '../interfaces';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { transformError } from '@detective.solutions/frontend/shared/error-handling';

@Injectable()
export class ConnectionsService {
  private getAllConnectionsWatchQuery!: QueryRef<Response>;

  constructor(private readonly getAllConnectionsGQL: GetAllConnectionsGQL) {}

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
          connections: response.querySourceConnection.map(DataSource.Build),
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

  //   private handleError(error: string) {
  //     this.tableCellEventService.resetLoadingStates$.next(true);
  //     return transformError(error);
  //   }
}
