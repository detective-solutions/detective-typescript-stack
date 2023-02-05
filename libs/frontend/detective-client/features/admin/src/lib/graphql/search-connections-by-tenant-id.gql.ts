import { Query, gql } from 'apollo-angular';

import { ISourceConnection } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface ISearchConnectionsByTenantGQLResponse {
  querySourceConnection: ISourceConnection[];
}

@Injectable()
export class SearchConnectionsByTenantGQL extends Query<Response> {
  override document = gql`
    query searchConnectionsByTenantId(
      $tenantId: String!
      $paginationOffset: Int!
      $pageSize: Int!
      $searchTerm: String
    ) {
      querySourceConnection(
        offset: $paginationOffset
        first: $pageSize
        order: { asc: name }
        filter: {
          name: { regexp: $searchTerm }
          or: { description: { alloftext: $searchTerm }, connectorName: { regexp: $searchTerm } }
        }
      ) @cascade {
        id: xid
        tenant(filter: { xid: { eq: $tenantId } }) {
          id: xid
        }
        name
        connectorName
        description
        status
        lastUpdated
      }
    }
  `;
}
