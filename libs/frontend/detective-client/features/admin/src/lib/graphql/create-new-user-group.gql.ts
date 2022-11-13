/* eslint-disable sort-imports */
import { Mutation, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';
import { IUserGroup } from '@detective.solutions/shared/data-access';

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
          xid
          name
          description
          author {
            xid
          }
          tenant {
            xid
          }
          members {
            xid
          }
          lastUpdated
          created
        }
      }
    }
  `;
}
