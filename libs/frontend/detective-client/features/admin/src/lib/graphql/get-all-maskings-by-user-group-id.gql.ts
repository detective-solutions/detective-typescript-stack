import { Query, gql } from 'apollo-angular';

import { IMasking } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetMaskingByUserGroupIdGQLResponse {
  queryMasking: IMasking[];
}

@Injectable()
export class GetMaskingByUserGroupIdGQL extends Query<Response> {
  override document = gql`
    query queryMaskingByUserGroup($id: String!) {
      queryMasking @cascade(fields: ["groups"]) {
        id: xid
        name
        rows {
          id: xid
        }
        columns {
          id: xid
        }
        groups(filter: { xid: { eq: $id } }) {
          id: xid
        }
      }
    }
  `;
}
