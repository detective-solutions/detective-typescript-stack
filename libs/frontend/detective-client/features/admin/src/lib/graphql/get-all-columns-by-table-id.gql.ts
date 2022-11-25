import { Query, gql } from 'apollo-angular';

import { Injectable } from '@angular/core';

@Injectable()
export class GetAllColumnsGQL extends Query<Response> {
  override document = gql`
    query ColumnDefinition($xid: String) {
      queryColumnDefinition @cascade {
        xid
        columnName
        columnType
        schemaTable(filter: { xid: { eq: $xid } }) {
          xid
        }
      }
    }
  `;
}
