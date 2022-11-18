/* eslint-disable sort-imports */
import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { IMasking } from '@detective.solutions/shared/data-access';

export interface IGetMaskingByUserGroupIdGQLResponse {
  queryMasking: IMasking[];
}

@Injectable()
export class GetMaskingByUserGroupIdGQL extends Query<Response> {
  override document = gql`
    query queryMaskingByUserGroup($xid: String!) {
      queryMasking @cascade(fields: ["groups"]) {
        xid
        name
        rows {
          xid
        }
        columns {
          xid
        }
        groups(filter: { xid: { eq: $xid } }) {
          xid
        }
      }
    }
  `;
}
