import { Mutation, gql } from 'apollo-angular';

import { IUserGroup } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface ICreateUserGroupGQLResponse {
  addUserGroup: {
    userGroup: IUserGroup[];
  };
}

@Injectable()
export class CreateUserGroupGQL extends Mutation<Response> {
  override document = gql`
    mutation addUserGroup($userGroup: [AddUserGroupInput!]!) {
      addUserGroup(input: $userGroup, upsert: true) {
        userGroup {
          id: xid
          name
          description
          author {
            id: xid
          }
          tenant {
            id: xid
          }
          members {
            id: xid
          }
          lastUpdated
          created
        }
      }
    }
  `;
}
