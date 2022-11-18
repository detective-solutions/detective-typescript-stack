/* eslint-disable sort-imports */
import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { IUserGroup } from '@detective.solutions/shared/data-access';

export interface IGetUserGroupByIdGQLResponse {
  getUserGroup: IUserGroup;
}

@Injectable()
export class GetUserGroupByIdGQL extends Query<Response> {
  override document = gql`
    query getUserGroupById($xid: String!) {
      getUserGroup(xid: $xid) {
        xid
        name
        members {
          xid
          firstname
          lastname
          email
        }
        description
        lastUpdated
      }
    }
  `;
}
