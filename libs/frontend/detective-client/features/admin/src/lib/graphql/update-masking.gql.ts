import { Mutation, gql } from 'apollo-angular';

import { IMasking } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IUpdateMaskingGQLResponse {
  updateMasking: {
    masking: IMasking[];
  };
}

@Injectable()
export class UpdateMaskingGQL extends Mutation<Response> {
  override document = gql`
    mutation updateMasking($patch: UpdateMaskingInput!) {
      updateMasking(input: $patch) {
        masking {
          id: xid
          name
          description
          columns {
            id: xid
            columnName
            visible
            replaceType
            author {
              id: xid
            }
            editors {
              id: xid
            }
            lastUpdatedBy {
              id: xid
            }
            lastUpdated
            created
          }
          rows {
            id: xid
            columnName
            valueName
            visible
            replaceType
            customReplaceValue
            author {
              id: xid
            }
            editors {
              id: xid
            }
            lastUpdatedBy {
              id: xid
            }
            lastUpdated
            created
          }
          lastUpdatedBy {
            id: xid
          }
          lastUpdatedBy {
            id: xid
          }
          lastUpdated
        }
      }
    }
  `;
}
