/* eslint-disable sort-imports */
import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { IDropDownValues } from '@detective.solutions/shared/data-access';

export interface IGetUserGroupsGQLResponse {
  queryUserGroup: IDropDownValues[];
}

@Injectable()
export class GetAllUserGroupsGQL extends Query<Response> {
  override document = gql`
    query UserGroup {
      queryUserGroup {
        key: xid
        value: name
      }
    }
  `;
}
