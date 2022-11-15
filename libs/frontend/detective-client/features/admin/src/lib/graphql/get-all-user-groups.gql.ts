/* eslint-disable sort-imports */
import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { IDropDownValues, IUserGroup } from '@detective.solutions/shared/data-access';

export interface IGetUserGroupsGQLResponse {
  queryUserGroup: IUserGroup[];
  aggregateUserGroup: { count: number };
}

export interface IGetUserGroupsAsDropDownValuesGQLResponse {
  queryUserGroup: IDropDownValues[];
}

//TODO: Filter only for users related to current tenant
@Injectable()
export class GetAllUserGroupsGQL extends Query<Response> {
  override document = gql`
    query UserGroup($xid: String, $paginationOffset: Int, $pageSize: Int) {
      queryUserGroup(offset: $paginationOffset, first: $pageSize, order: { asc: name }) @cascade(fields: ["tenant"]) {
        xid
        name
        description
        memberCount: membersAggregate {
          count
        }
        lastUpdated
        tenant(filter: { xid: { eq: $xid } }) {
          xid
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
    query UserGroup {
      queryUserGroup {
        key: xid
        value: name
      }
    }
  `;
}
