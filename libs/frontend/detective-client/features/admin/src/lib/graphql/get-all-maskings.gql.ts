import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { MaskingDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllMaskingsGQLResponse {
  queryMasking: MaskingDTO[];
  aggregateMasking: { count: number };
}

@Injectable()
export class GetAllMaskingsGQL extends Query<Response> {
  override document = gql`
    query Masking($id: String, $paginationOffset: Int, $pageSize: Int) {
      queryMasking(offset: $paginationOffset, first: $pageSize, order: { asc: name }) {
        id: xid
        name
        tenant(filter: { xid: { eq: $id } }) {
          id: xid
        }
        description
        table {
          id: xid
          name
          dataSource {
            id: xid
            name
          }
        }
        groups {
          id: xid
          name
        }
        lastUpdatedBy {
          firstname
          lastname
        }
        lastUpdated
      }
      aggregateMasking {
        count
      }
    }
  `;
}
