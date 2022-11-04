/* eslint-disable sort-imports */
import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { UserIdDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetUserIdGQLResponse {
  getUser: UserIdDTO[];
}

@Injectable()
export class GetUserIdGQL extends Query<Response> {
  override document = gql`
    query User($xid: String) {
      getUser(xid: $xid) {
        id
      }
    }
  `;
}
