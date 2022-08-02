import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { SourceConnection } from '@detective.solutions/frontend/shared/data-access';

export interface IGetConnectionByIdGQLResponse {
  getSourceConnection: SourceConnection;
}

@Injectable()
export class GetConnectionByIdGQL extends Query<Response> {
  override document = gql`
    query getSourceConnectionById($id: String!) {
      getSourceConnection(xid: $id) {
        name
      }
    }
  `;
}
