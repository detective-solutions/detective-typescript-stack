import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllDataSourcesGQLResponse {
  querySourceConnection: SourceConnectionDTO[];
  aggregateSourceConnection: { count: number };
}

@Injectable()
export class GetAllDataSourcesGQL extends Query<Response> {
  override document = gql`
    query dataSources($paginationOffset: Int, $pageSize: Int) {
      querySourceConnection(offset: $paginationOffset, first: $pageSize, order: { asc: name }) {
        xid
        name
        description
        connectorName
      }
      aggregateSourceConnection {
        count
      }
    }
  `;
}
