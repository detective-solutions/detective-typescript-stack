import { Query, gql } from 'apollo-angular';

import { IColumn } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetAllColumnsGQLResponse {
  queryColumnDefinition: IColumn[];
}

@Injectable()
export class GetAllColumnsGQL extends Query<Response> {
  override document = gql`
    query ColumnDefinition($tableId: String) {
      queryColumnDefinition @cascade {
        id: xid
        columnName
        columnType
        schemaTable(filter: { xid: { eq: $tableId } }) {
          id: xid
        }
      }
    }
  `;
}
