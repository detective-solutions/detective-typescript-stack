import { Query, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';

export interface ISearchDataSourcesByTenantGQLResponse {
  querySourceConnection: SourceConnectionDTO[];
}

@Injectable()
export class SearchDataSourcesByTenantGQL extends Query<Response> {
  override document = gql`
    query searchDataSourcesByTenant($tenantId: String!, $paginationOffset: Int!, $pageSize: Int!, $searchTerm: String) {
      querySourceConnection(
        offset: $paginationOffset
        first: $pageSize
        order: { asc: name }
        filter: { name: { regexp: $searchTerm }, or: { description: { alloftext: $searchTerm } } }
      ) @cascade {
        xid
        tenant(filter: { xid: { eq: $tenantId } }) {
          xid
        }
        name
        description
        connectorName
        lastUpdated
      }
    }
  `;
}
