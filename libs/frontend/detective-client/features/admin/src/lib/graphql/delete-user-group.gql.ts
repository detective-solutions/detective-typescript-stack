import { Mutation, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';

export interface IDeleteUserGroupGQLResponse {
  deleteUserGroup: {
    msg: string;
  };
}

@Injectable()
export class DeleteUserGroupGQL extends Mutation<Response> {
  override document = gql`
    mutation deleteUserGroup($filter: UserGroupFilter!) {
      deleteUserGroup(filter: $filter) {
        msg
      }
    }
  `;
}
