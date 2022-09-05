import { Query, gql } from 'apollo-angular';

import { IUser } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetWhiteboardUserByIdGQLResponse {
  getUser: Partial<IUser>;
}

@Injectable()
export class GetWhiteboardUserByIdGQL extends Query<Response> {
  override document = gql`
    query getWhiteboardUserById($id: String!) {
      getUser(xid: $id) {
        id: xid
        email
        role
        firstname
        lastname
        title
        avatarUrl
      }
    }
  `;
}
