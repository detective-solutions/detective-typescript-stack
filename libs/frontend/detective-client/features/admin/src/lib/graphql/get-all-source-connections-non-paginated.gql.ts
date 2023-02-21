import { Query, gql } from 'apollo-angular';
import { ISourceConnection } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetAllSourceConnectionsNonPaginatedGQLResponse {
  querySourceConnection: ISourceConnection[];
}

@Injectable()
export class GetAllSourceConnectionsNonPaginatedGQL extends Query<Response> {
  override document = gql`
    query getAllSourceConnections {
      querySourceConnection(order: { asc: name }) {
        id: xid
        name
      }
    }
  `;
}
