import { Query, gql } from 'apollo-angular';

import { IUser } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetUsersGQLResponse {
  queryUser: IUser[];
  aggregateUser: { count: number };
}
@Injectable()
export class GetAllUsersGQL extends Query<Response> {
  override document = gql`
    query User($id: String, $paginationOffset: Int, $pageSize: Int) {
      queryUser(offset: $paginationOffset, first: $pageSize, order: { asc: firstname }) {
        id: xid
        email
        tenants(filter: { xid: { eq: $id } }) {
          id: xid
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
