import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { SourceConnection } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllConnectionsGQLResponse {
  querySourceConnection: SourceConnection[];
  aggregateSourceConnection: { count: number };
}

@Injectable()
export class GetAllConnectionsGQL extends Query<Response> {
  override document = gql`
    query dataSources($paginationOffset: Int, $pageSize: Int) {
      querySourceConnection(offset: $paginationOffset, first: $pageSize) {
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
