import { Query, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';
import { UserGroupMember } from '@detective.solutions/shared/data-access';

export interface ISearchUserGroupMembersByTenantIdGQLResponse {
  queryUser: UserGroupMember[];
}

@Injectable()
export class SearchUserGroupMembersByTenantIdGQL extends Query<Response> {
  override document = gql`
    query searchUserGroupMembersByTenantId($tenantId: String!, $searchTerm: String!) {
      queryUser(
        order: { asc: firstname }
        filter: {
          email: { regexp: $searchTerm }
          or: { firstname: { regexp: $searchTerm }, lastname: { regexp: $searchTerm } }
        }
      ) @cascade {
        id: xid
        tenants(filter: { xid: { eq: $tenantId } }) {
          id: xid
        }
        email
        firstname
        lastname
      }
    }
  `;
}
