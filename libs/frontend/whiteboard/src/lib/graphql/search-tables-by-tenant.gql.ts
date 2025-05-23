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
    query searchTablesByTenant($tenantId: String!, $searchTerm: String) {
      querySourceConnection(
        filter: { status: { eq: "${SourceConnectionStatus.AVAILABLE}" } }
      ) @cascade {
        id: xid
        tenant(filter: {xid: {eq: $tenantId } }) {
          id: xid
        }
        connectorName
        connectedTables(filter: { name: { regexp: $searchTerm } }) {
          id: xid
          name
          baseQuery
        }
      }
    }
  `;
}
