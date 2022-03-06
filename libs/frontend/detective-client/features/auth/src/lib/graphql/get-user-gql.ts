import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class GetUserGQL extends Query<Response> {
  override document = gql`
    query user($userId: ID!) {
      getUser(id: $userId) {
        id
        email
        tenantIds: tenants {
          id
        }
        firstname
        lastname
        title
      }
    }
  `;
}
