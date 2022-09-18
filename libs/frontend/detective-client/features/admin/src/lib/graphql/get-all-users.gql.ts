/* eslint-disable sort-imports */
import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { IUser } from '@detective.solutions/shared/data-access';

export interface IGetUsersGQLResponse {
  queryUser: IUser[];
  aggregateUser: { count: number };
}

//TODO: Filter only for users related to current tenant
@Injectable()
export class GetAllUsersGQL extends Query<Response> {
  override document = gql`
    query User {
      queryUser {
        email
        role
        firstname
        lastname
        tenantIds: tenants {
          xid
        }
      }
      aggregateUser {
        count
      }
    }
  `;
}
