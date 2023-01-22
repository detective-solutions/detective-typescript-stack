import { Query, gql } from 'apollo-angular';

import { IUserGroup } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetUserGroupByIdGQLResponse {
  getUserGroup: IUserGroup;
}

@Injectable()
export class GetUserGroupByIdGQL extends Query<Response> {
  override document = gql`
    query getUserGroupById($userGroupId: String!) {
      getUserGroup(xid: $userGroupId) {
        id: xid
        name
        members {
          id: xid
          firstname
          lastname
          email
        }
        description
        lastUpdated
      }
    }
  `;
}
