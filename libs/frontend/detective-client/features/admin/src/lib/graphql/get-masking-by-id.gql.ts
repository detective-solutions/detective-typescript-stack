import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { MaskingDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetMaskingByIdGQLResponse {
  getMasking: MaskingDTO;
}

@Injectable()
export class GetMaskingByIdGQL extends Query<Response> {
  override document = gql`
    query getMaskingById($id: String!) {
      getMasking(xid: $id) {
        name
      }
    }
  `;
}
