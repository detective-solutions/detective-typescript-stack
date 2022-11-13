/* eslint-disable sort-imports */
import { Mutation, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { IUserGroup } from '@detective.solutions/shared/data-access';
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
