/* eslint-disable sort-imports */
import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { IUser } from '@detective.solutions/shared/data-access';

export interface IGetUserByIdGQLResponse {
  getUser: IUser;
}

@Injectable()
export class GetUserByIdGQL extends Query<Response> {
  override document = gql`
    query getUserById($id: String!) {
      getUser(xid: $id) {
        id: xid
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
    }
  `;
}
