import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';

export interface GetConnectionByTableIdGQLResponse {
  getTable: {
    dataSource: {
      xid: string;
      name: string;
    };
  };
}

@Injectable()
export class GetConnectionByTableIdGQL extends Query<Response> {
  override document = gql`
    query getTable($xid: String!) {
      getTable(xid: $xid) {
        dataSource {
          xid
          name
        }
      }
    }
  `;
}
