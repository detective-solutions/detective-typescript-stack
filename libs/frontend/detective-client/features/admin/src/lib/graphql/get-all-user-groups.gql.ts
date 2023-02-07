import { Query, gql } from 'apollo-angular';

import { IUserGroup } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetUserGroupsGQLResponse {
  queryUserGroup: IUserGroup[];
  aggregateUserGroup: { count: number };
}

@Injectable()
export class GetAllUserGroupsGQL extends Query<Response> {
  override document = gql`
    query UserGroup($userGroupId: String, $paginationOffset: Int, $pageSize: Int) {
      queryUserGroup(offset: $paginationOffset, first: $pageSize, order: { asc: name }) @cascade(fields: ["tenant"]) {
        id: xid
        name
        description
        memberCount: membersAggregate {
          count
        }
        lastUpdated
        tenant(filter: { xid: { eq: $userGroupId } }) {
          id: xid
        }
      }
      aggregateUserGroup {
        count
      }
    }
  `;
}
