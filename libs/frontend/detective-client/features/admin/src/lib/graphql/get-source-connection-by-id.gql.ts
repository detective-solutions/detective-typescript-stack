import { Query, gql } from 'apollo-angular';
import { ISourceConnection } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetSourceConnectionByIdGQLResponse {
  getSourceConnection: ISourceConnection;
}

@Injectable()
export class GetSourceConnectionByIdGQL extends Query<Response> {
  override document = gql`
    query getSourceConnectionById($tenantId: String!, $connectionId: String!) {
      getSourceConnection(xid: $connectionId) {
        id: xid
        tenant(filter: { xid: { eq: $tenantId } }) {
          id: xid
        }
        name
      }
    }
  `;
}
