import { Query, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';

export interface IGetAllUsersCountGQLResponse {
  aggregateUser: { count: number };
}

@Injectable()
export class GetAllUsersCountGQL extends Query<Response> {
  override document = gql`
    query getAllUsersCount {
      aggregateUser {
        count
      }
    }
  `;
}
