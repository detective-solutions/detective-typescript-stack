import { Query, gql } from 'apollo-angular';
import { IUser } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetCurrentUserGQLResponse {
  getUser: IUser;
}

@Injectable()
export class GetUserGQL extends Query<Response> {
  override document = gql`
    query user($userId: ID!) {
      getUser(id: $userId) {
        id
        email
        tenantIds: tenants {
          id
        }
        firstname
        lastname
        title
      }
    }
  `;
}
