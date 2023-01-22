import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { MaskingDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetMaskingByIdGQLResponse {
  getMasking: MaskingDTO;
}

@Injectable()
export class GetMaskingByIdGQL extends Query<Response> {
  override document = gql`
    query getMaskingById($id: String!) {
      getMasking(xid: $id) {
        id: xid
        name
        tenant {
          id: xid
        }
        description
        table {
          id: xid
          name
          dataSource {
            id: xid
            name
          }
        }
        groups {
          id: xid
          name
        }
        author {
          id: xid
          firstname
          lastname
        }
        columns {
          id: xid
          columnName
          visible
          replaceType
          author {
            id: xid
            firstname
            lastname
          }
          editors {
            id: xid
            firstname
            lastname
          }
          lastUpdatedBy {
            id: xid
            firstname
            lastname
          }
          lastUpdated
          created
        }
        rows {
          id: xid
          columnName
          valueName
          visible
          replaceType
          customReplaceValue
          author {
            id: xid
            firstname
            lastname
          }
          editors {
            id: xid
            firstname
            lastname
          }
          lastUpdatedBy {
            id: xid
            firstname
            lastname
          }
          lastUpdated
          created
        }
        lastUpdatedBy {
          id: xid
          firstname
          lastname
        }
        lastUpdated
        created
      }
    }
  `;
}
