/* eslint-disable sort-imports */
import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { IUser } from '@detective.solutions/shared/data-access';

export interface IGetUsersGQLResponse {
  queryUser: IUser[];
  aggregateUser: { count: number };
}
@Injectable()
export class GetAllUsersGQL extends Query<Response> {
  override document = gql`
    query User($xid: String, $paginationOffset: Int, $pageSize: Int) {
      queryUser(offset: $paginationOffset, first: $pageSize, order: { asc: firstname }) {
        id: xid
        email
        tenants(filter: { xid: { eq: $xid } }) {
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
