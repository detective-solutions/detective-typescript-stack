/* eslint-disable sort-imports */
import { Mutation, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';
import { IMasking } from '@detective.solutions/shared/data-access';

export interface ICreateNewMaskingGQLResponse {
  addMasking: {
    masking: IMasking;
  };
}

@Injectable()
export class CreateNewMaskingGQL extends Mutation<Response> {
  override document = gql`
    mutation addMasking($masking: [AddMaskingInput!]!) {
      addMasking(input: $masking, upsert: true) {
        masking {
          xid
          name
          description
          author {
            xid
          }
          groups {
            xid
          }
          table {
            xid
          }
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
          lastUpdated
          created
        }
      }
    }
  `;
}

@Injectable()
export class CreateNewRowMaskGQL extends Mutation<Response> {
  override document = gql`
    mutation addRowMask($rowMask: [AddRowMaskInput!]!) {
      addRowMask(input: $rowMask) {
        rowMask {
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
      }
    }
  `;
}

@Injectable()
export class CreateNewColumnMaskGQL extends Mutation<Response> {
  override document = gql`
    mutation addColumnMask($columnMask: [AddColumnMaskInput!]!) {
      addColumnMask(input: $columnMask) {
        columnMask {
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
      }
    }
  `;
}
