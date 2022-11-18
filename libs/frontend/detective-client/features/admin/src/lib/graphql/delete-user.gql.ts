/* eslint-disable sort-imports */
import { Mutation, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';

export interface IDeleteUserGQLResponse {
  deleteUser: {
    msg: string;
  };
}

@Injectable()
export class DeleteUserGQL extends Mutation<Response> {
  override document = gql`
    mutation deleteUser($filter: UserFilter!) {
      deleteUser(filter: $filter) {
        msg
      }
    }
  `;
}
