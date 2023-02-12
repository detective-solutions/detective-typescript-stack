import { Query, gql } from 'apollo-angular';

import { IMasking } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface ISearchMaskingsByTenantGQLResponse {
  queryMasking: IMasking[];
}

@Injectable()
export class SearchMaskingsByTenantIdGQL extends Query<Response> {
  override document = gql`
    query searchMaskingsByTenantId($tenantId: String!, $paginationOffset: Int!, $pageSize: Int!, $searchTerm: String) {
      queryMasking(
        offset: $paginationOffset
        first: $pageSize
        order: { asc: name }
        filter: { name: { regexp: $searchTerm }, or: { description: { alloftext: $searchTerm } } }
      ) @cascade {
        id: xid
        tenant(filter: { xid: { eq: $tenantId } }) {
          id: xid
        }
        name
        description
        table {
          id: xid
          name
          dataSource {
            id: xid
            name
          }
        }
        groups {
          id: xid
          name
        }
        lastUpdatedBy {
          id: xid
          firstname
          lastname
        }
        lastUpdated
      }
    }
  `;
}
