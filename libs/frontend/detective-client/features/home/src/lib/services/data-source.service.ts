import { GetAllDataSourcesGQL, IGetAllDataSourcesGQLResponse } from '../graphql/get-all-data-sources-gql';
import { Observable, catchError, map } from 'rxjs';

import { DataSource } from '@detective.solutions/frontend/shared/data-access';
import { IGetAllDataSourcesResponse } from '../interfaces/get-all-data-sources-response.interface';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';
import { transformError } from '@detective.solutions/frontend/shared/error-handling';

@Injectable()
export class DataSourceService {
  private getAllDataSourcesWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getAllDataSourcesGQL: GetAllDataSourcesGQL,
    private readonly tableCellEventService: TableCellEventService
  ) {}

  getAllDataSources(paginationOffset: number, pageSize: number): Observable<IGetAllDataSourcesResponse> {
    this.getAllDataSourcesWatchQuery = this.getAllDataSourcesGQL.watch({
      paginationOffset: paginationOffset,
      pageSize: pageSize,
    });
    return this.getAllDataSourcesWatchQuery.valueChanges.pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((response: any) => response.data),
      map((response: IGetAllDataSourcesGQLResponse) => {
        return {
          dataSources: response.querySourceConnection.map(DataSource.Build),
          totalElementsCount: response.aggregateSourceConnection.count,
        };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getAllDataSourcesNextPage(paginationOffset: number, pageSize: number) {
    this.getAllDataSourcesWatchQuery
      .fetchMore({
        variables: { paginationOffset: paginationOffset, pageSize: pageSize },
      })
      .catch((error) => this.handleError(error));
  }

  private handleError(error: string) {
    this.tableCellEventService.resetLoadingStates$.next(true);
    return transformError(error);
  }
}
