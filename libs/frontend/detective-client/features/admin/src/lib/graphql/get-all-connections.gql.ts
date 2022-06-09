import { Query, gql } from 'apollo-angular';
import { DataSource } from '@detective.solutions/frontend/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetAllConnectionsGQLResponse {
  querySourceConnection: DataSource[];
  aggregateSourceConnection: { count: number };
}

@Injectable()
export class GetAllConnectionsGQL extends Query<Response> {
  override document = gql`
    query dataSources($paginationOffset: Int, $pageSize: Int) {
      querySourceConnection(offset: $paginationOffset, first: $pageSize) {
        id
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
