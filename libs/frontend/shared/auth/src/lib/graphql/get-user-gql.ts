import { Query, gql } from 'apollo-angular';
import { IUser } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetCurrentUserGQLResponse {
  getUser: IUser;
}

// TODO: This is not needed in this module anymore, but kept for future usage in other modules
@Injectable()
export class GetUserGQL extends Query<Response> {
  override document = gql`
    query user($userId: String!) {
      getUser(xid: $userId) {
        id: xid
        email
        tenantIds: tenants {
          id: xid
        }
        firstname
        lastname
        title
      }
    }
  `;
}
