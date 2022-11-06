/* eslint-disable sort-imports */
import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { IUser } from '@detective.solutions/shared/data-access';

export interface IGetUsersGQLResponse {
  queryUser: IUser[];
  aggregateUser: { count: number };
}

//TODO: Filter only for users related to current tenant
// tenants(filter: { xid: { eq: "4091e594-3cb5-11ed-95e8-ebca79b0263f" } })
@Injectable()
export class GetAllUsersGQL extends Query<Response> {
  override document = gql`
    query User($paginationOffset: Int, $pageSize: Int) {
      queryUser(offset: $paginationOffset, first: $pageSize, order: { asc: firstname }) {
        xid
        email
        tenants {
          xid
        }
        role
        firstname
        lastname
        title
        avatarUrl
        lastUpdated
      }
      aggregateUser {
        count
      }
    }
  `;
}
