import { Query, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';

@Injectable()
export class GetAllColumnsGQL extends Query<Response> {
  override document = gql`
    query ColumnDefinition($id: String) {
      queryColumnDefinition @cascade {
        id: xid
        columnName
        columnType
        schemaTable(filter: { xid: { eq: $id } }) {
          id: xid
        }
      }
    }
  `;
}
