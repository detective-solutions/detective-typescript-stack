import { Query, gql } from 'apollo-angular';

import { CasefileDTO } from '@detective.solutions/frontend/shared/data-access';
import { Injectable } from '@angular/core';

export interface ISearchCasefilesByTenantGQLResponse {
  queryCasefile: CasefileDTO[];
}

@Injectable()
export class SearchCasefilesByTenantGQL extends Query<Response> {
  override document = gql`
    query searchCasefilesByTenant(
      $tenantId: String!
      $paginationOffset: Int!
      $pageSize: Int!
      $filterByCurrentUser: Boolean!
      $searchTerm: String
      $authorId: String
    ) {
      queryCasefile(
        offset: $paginationOffset
        first: $pageSize
        order: { asc: title }
        filter: { title: { regexp: $searchTerm }, or: { description: { alloftext: $searchTerm } } }
      ) @cascade {
        id: xid
        tenant(filter: { xid: { eq: $tenantId } }) {
          id: xid
        }
        title
        description
        author(filter: { xid: { eq: $authorId } }) @include(if: $filterByCurrentUser) {
          id: xid
          firstname
          lastname
        }
        views
        lastUpdated
      }
    }
  `;
}
