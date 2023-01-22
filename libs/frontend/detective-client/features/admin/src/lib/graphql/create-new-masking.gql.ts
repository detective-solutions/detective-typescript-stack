import { Mutation, gql } from 'apollo-angular';

import { IMasking } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

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
          id: xid
          name
          tenant {
            id: xid
          }
          description
          author {
            id: xid
          }
          groups {
            id: xid
          }
          table {
            id: xid
          }
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
      }
    }
  `;
}
