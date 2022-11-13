/* eslint-disable sort-imports */
import { Mutation, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';

export interface IDeleteMaskingGQLResponse {
  deleteMasking: {
    message: string;
  };
}

@Injectable()
export class DeleteMaskingGQL extends Mutation<Response> {
  override document = gql`
    mutation deleteMasking($filter: MaskingFilter!) {
      deleteMasking(filter: $filter) {
        msg
      }
    }
  `;
}

@Injectable()
export class DeleteColumnMaskGQL extends Mutation<Response> {
  override document = gql`
    mutation deleteColumnMask($filter: ColumnMaskFilter!) {
      deleteColumnMask(filter: $filter) {
        msg
      }
    }
  `;
}

@Injectable()
export class DeleteRowMaskGQL extends Mutation<Response> {
  override document = gql`
    mutation deleteRowMask($filter: RowMaskFilter!) {
      deleteRowMask(filter: $filter) {
        msg
      }
    }
  `;
}
