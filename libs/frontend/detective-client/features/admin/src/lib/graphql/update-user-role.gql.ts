import { Mutation, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';

export interface IUpdateUserRoleGQLResponse {
  updateUser: {
    user: [
      {
        role: string;
        lastUpdated: string;
      }
    ];
  };
}

@Injectable()
export class UpdateUserRoleGQL extends Mutation<Response> {
  override document = gql`
    mutation updateUser($patch: UpdateUserInput!) {
      updateUser(input: $patch) {
        user {
          role
          lastUpdated
        }
      }
    }
  `;
}
