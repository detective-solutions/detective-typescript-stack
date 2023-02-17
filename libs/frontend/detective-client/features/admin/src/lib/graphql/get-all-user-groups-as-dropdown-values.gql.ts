import { Query, gql } from 'apollo-angular';

import { IDropDownValues } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetUserGroupsAsDropDownValuesGQLResponse {
  queryUserGroup: IDropDownValues[];
}

@Injectable()
export class GetAllUserGroupsAsDropDownValuesGQL extends Query<Response> {
  override document = gql`
    query UserGroup($tenantId: String) {
      queryUserGroup {
        id: xid
        tenant(filter: { xid: { eq: $tenantId } }) {
          id: xid
        }
        value: name
      }
    }
  `;
}
