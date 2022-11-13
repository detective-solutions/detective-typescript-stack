import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { MaskingDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetMaskingByUserGroupIdGQLResponse {
  queryMasking: MaskingDTO;
}

@Injectable()
export class GetMaskingByUserGroupIdGQL extends Query<Response> {
  override document = gql`
    query queryMasking($xid: String!) {
      queryMasking @cascade {
        xid
        name
        groups(filter: { xid: { eq: $xid } }) {
          xid
        }
      }
    }
  `;
}
