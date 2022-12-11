import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllWhiteboardTablesResponse {
  tables: any[];
}

export interface IGetAllWhiteboardTablesGQLResponse {
  querySourceConnection: SourceConnectionDTO[];
}

@Injectable()
export class GetAllWhiteboardTablesGQL extends Query<Response> {
  override document = gql`
    query querySourceConnection($paginationOffset: Int, $pageSize: Int) {
      querySourceConnection(offset: $paginationOffset, first: $pageSize, order: { asc: name }) {
        xid
        name
        connectorName
        status
        connectedTables {
          xid
          name
        }
      }
    }
  `;
}
