import { Query, gql } from 'apollo-angular';

import { IUser } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface ISearchUserGroupsByTenantGQLResponse {
  queryUserGroup: IUser[];
}

@Injectable()
export class SearchUserGroupsByTenantGQL extends Query<Response> {
  override document = gql`
    query searchUserGroupsByTenantId(
      $tenantId: String!
      $paginationOffset: Int!
      $pageSize: Int!
      $searchTerm: String
    ) {
      queryUserGroup(
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
        memberCount: membersAggregate {
          count
        }
        lastUpdated
      }
    }
  `;
}
