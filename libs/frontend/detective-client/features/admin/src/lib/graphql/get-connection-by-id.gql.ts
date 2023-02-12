import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetConnectionByIdGQLResponse {
  getSourceConnection: SourceConnectionDTO;
}

@Injectable()
export class GetConnectionByIdGQL extends Query<Response> {
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
