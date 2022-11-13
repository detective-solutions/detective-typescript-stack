/* eslint-disable sort-imports */
import { Mutation, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';
import { IMasking } from '@detective.solutions/shared/data-access';

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
          xid
          name
          description
          columns {
            xid
            columnName
            visible
            replaceType
            author {
              xid
            }
            editors {
              xid
            }
            lastUpdatedBy {
              xid
            }
            lastUpdated
            created
          }
          rows {
            xid
            columnName
            valueName
            visible
            replaceType
            customReplaceValue
            author {
              xid
            }
            editors {
              xid
            }
            lastUpdatedBy {
              xid
            }
            lastUpdated
            created
          }
          lastUpdatedBy {
            xid
          }
          lastUpdatedBy {
            xid
          }
          lastUpdated
        }
      }
    }
  `;
}
