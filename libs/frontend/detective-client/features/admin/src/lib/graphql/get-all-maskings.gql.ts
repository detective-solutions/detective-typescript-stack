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
    query Masking($xid: String, $paginationOffset: Int, $pageSize: Int) {
      queryMasking(offset: $paginationOffset, first: $pageSize, order: { asc: name }) {
        xid
        name
        tenant(filter: { xid: { eq: $xid } }) {
          xid
        }
        description
        table {
          xid
          name
          dataSource {
            xid
            name
          }
        }
        groups {
          xid
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
