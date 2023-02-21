import { Mutation, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';

export interface IDeleteUserByIdGQLResponse {
  deleteUser: {
    msg: string;
  };
}

@Injectable()
export class DeleteUserByIdGQL extends Mutation<Response> {
  override document = gql`
    mutation deleteUser($filter: UserFilter!) {
      deleteUser(filter: $filter) {
        msg
      }
    }
  `;
}
