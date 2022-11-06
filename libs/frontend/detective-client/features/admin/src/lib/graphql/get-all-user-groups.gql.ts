/* eslint-disable sort-imports */
import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { IUserGroup } from '@detective.solutions/shared/data-access';

export interface IGetUserGroupsGQLResponse {
  queryUserGroup: IUserGroup[];
  aggregateUserGroup: { count: number };
}

//TODO: Filter only for users related to current tenant
@Injectable()
export class GetAllUserGroupsGQL extends Query<Response> {
  override document = gql`
    query UserGroup($paginationOffset: Int, $pageSize: Int) {
      queryUserGroup(offset: $paginationOffset, first: $pageSize, order: { asc: name }) @cascade(fields: ["tenant"]) {
        xid
        name
        description
        members: membersAggregate {
          count
        }
        lastUpdated
        tenant(filter: { xid: { eq: "8d735a62-dcc7-11ec-b37f-287fcf6e439d" } }) {
          xid
        }
      }
      aggregateUserGroup {
        count
      }
    }
  `;
}
