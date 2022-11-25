import { Mutation, gql } from 'apollo-angular';

import { IUserGroup } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IUpdateUserGroupGQLResponse {
  updateUserGroup: {
    userGroup: IUserGroup[];
  };
}

@Injectable()
export class UpdateUserGroupGQL extends Mutation<Response> {
  override document = gql`
    mutation updateUserGroup($patch: UpdateUserGroupInput!) {
      updateUserGroup(input: $patch) {
        userGroup {
          xid
          name
          description
          members {
            xid
          }
          lastUpdated
          lastUpdatedBy {
            xid
          }
        }
      }
    }
  `;
}
