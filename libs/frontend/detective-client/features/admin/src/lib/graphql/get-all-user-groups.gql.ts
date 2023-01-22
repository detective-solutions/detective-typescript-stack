import { IDropDownValues, IUserGroup } from '@detective.solutions/shared/data-access';
import { Query, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';

export interface IGetUserGroupsGQLResponse {
  queryUserGroup: IUserGroup[];
  aggregateUserGroup: { count: number };
}

export interface IGetUserGroupsAsDropDownValuesGQLResponse {
  queryUserGroup: IDropDownValues[];
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

@Injectable()
export class GetAllUserGroupsAsDropDownValuesGQL extends Query<Response> {
  override document = gql`
    query UserGroup($id: String) {
      queryUserGroup {
        id: xid
        value: name
        tenant(filter: { xid: { eq: $id } }) {
          id: xid
        }
      }
    }
  `;
}
