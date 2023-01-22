import { Query, gql } from 'apollo-angular';
import { ISourceConnectionTables } from '@detective.solutions/frontend/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetTablesBySourceConnectionIdGQLResponse {
  getSourceConnection: ISourceConnectionTables;
}

@Injectable()
export class GetTablesBySourceConnectionIdGQL extends Query<Response> {
  override document = gql`
    query getTablesOfSourceConnectionById($id: String!) {
      getSourceConnection(xid: $id) {
        connectedTables {
          id: xid
          name
          columns {
            id: xid
            columnName
          }
        }
      }
    }
  `;
}
