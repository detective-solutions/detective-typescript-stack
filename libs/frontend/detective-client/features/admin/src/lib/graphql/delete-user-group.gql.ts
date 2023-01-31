import { Mutation, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';

export interface IDeleteUserGroupByIdGQLResponse {
  deleteUserGroup: {
    msg: string;
  };
}

@Injectable()
export class DeleteUserGroupByIdGQL extends Mutation<Response> {
  override document = gql`
    mutation deleteUserGroup($filter: UserGroupFilter!) {
      deleteUserGroup(filter: $filter) {
        msg
      }
    }
  `;
}
