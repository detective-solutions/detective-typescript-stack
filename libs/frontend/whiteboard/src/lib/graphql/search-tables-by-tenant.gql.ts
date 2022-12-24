import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';
import { SourceConnectionStatus } from '@detective.solutions/shared/data-access';

export interface ISearchTablesByTenantGQLResponse {
  querySourceConnection: SourceConnectionDTO[];
}

@Injectable()
export class SearchTablesByTenantGQL extends Query<Response> {
  override document = gql`
    query searchTablesByTenant($tenantId: String!, $paginationOffset: Int!, $pageSize: Int!, $searchTerm: String) {
      querySourceConnection(
        offset: $paginationOffset
        first: $pageSize
        filter: { status: { eq: "${SourceConnectionStatus.AVAILABLE}" } }
        order: { asc: name }
      ) @cascade {
        xid
        tenant(filter: {xid: {eq: $tenantId } }) {
          xid
        }
        connectorName
        connectedTables(filter: { name: { regexp: $searchTerm } }) {
          xid
          name
        }
      }
    }
  `;
}
