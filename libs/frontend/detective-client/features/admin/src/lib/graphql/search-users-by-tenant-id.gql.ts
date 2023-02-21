import { Query, gql } from 'apollo-angular';

import { IUser } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface ISearchUsersByTenantGQLResponse {
  queryUser: IUser[];
  aggregateUser: { count: number };
}

@Injectable()
export class SearchUsersByTenantGQL extends Query<Response> {
  override document = gql`
    query searchUsersByTenantId($tenantId: String!, $paginationOffset: Int!, $pageSize: Int!, $searchTerm: String) {
      queryUser(
        offset: $paginationOffset
        first: $pageSize
        order: { asc: email }
        filter: {
          email: { regexp: $searchTerm }
          or: { firstname: { regexp: $searchTerm }, lastname: { regexp: $searchTerm }, title: { regexp: $searchTerm } }
        }
      ) @cascade {
        id: xid
        tenants(filter: { xid: { eq: $tenantId } }) {
          id: xid
        }
        email
        firstname
        lastname
        role
        title
        lastUpdated
      }
      aggregateUser {
        count
      }
    }
  `;
}
