import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { SourceConnectionTableDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetTablesBySourceConnectionIdGQLResponse {
  getSourceConnection: SourceConnectionTableDTO;
}

@Injectable()
export class GetTablesBySourceConnectionIdGQL extends Query<Response> {
  override document = gql`
    query getTablesOfSourceConnectionById($id: String!) {
      getSourceConnection(xid: $id) {
        connectedTables {
          xid
          name
        }
      }
    }
  `;
}
