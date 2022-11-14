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
    query Masking($paginationOffset: Int, $pageSize: Int) {
      queryMasking(offset: $paginationOffset, first: $pageSize, order: { asc: name }) {
        xid
        name
        description
        table {
          name
          dataSource {
            name
          }
        }
        groups {
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
