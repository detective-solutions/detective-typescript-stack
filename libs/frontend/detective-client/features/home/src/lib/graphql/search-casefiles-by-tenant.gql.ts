import { Query, gql } from 'apollo-angular';

import { CasefileDTO } from '@detective.solutions/frontend/shared/data-access';
import { Injectable } from '@angular/core';

export interface ISearchCasefilesByTenantGQLResponse {
  queryCasefile: CasefileDTO[];
  aggregateCasefile: { count: number };
}

@Injectable()
export class SearchCasefilesByTenantGQL extends Query<Response> {
  override document = gql`
    query searchCasefilesByTenant($tenantId: String!, $paginationOffset: Int!, $pageSize: Int!, $searchTerm: String) {
      queryCasefile(
        offset: $paginationOffset
        first: $pageSize
        order: { asc: title }
        filter: { title: { regexp: $searchTerm }, or: { description: { alloftext: $searchTerm } } }
      ) {
        id: xid
        tenant(filter: { xid: { eq: $tenantId } }) {
          xid
        }
        title
        description
        thumbnail
        author {
          firstname
          lastname
        }
        views
        lastUpdated
      }
      aggregateCasefile {
        count
      }
    }
  `;
}
