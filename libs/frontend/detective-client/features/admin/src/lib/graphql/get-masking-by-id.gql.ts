import { Query, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { MaskingDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetMaskingByIdGQLResponse {
  getMasking: MaskingDTO;
}

@Injectable()
export class GetMaskingByIdGQL extends Query<Response> {
  override document = gql`
    query getMaskingById($xid: String!) {
      getMasking(xid: $xid) {
        xid
        name
        tenant {
          xid
        }
        description
        table {
          xid
          name
          dataSource {
            xid
            name
          }
        }
        groups {
          xid
          name
        }
        author {
          xid
          firstname
          lastname
        }
        columns {
          xid
          columnName
          visible
          replaceType
          author {
            xid
            firstname
            lastname
          }
          editors {
            xid
            firstname
            lastname
          }
          lastUpdatedBy {
            xid
            firstname
            lastname
          }
          lastUpdated
          created
        }
        rows {
          xid
          columnName
          valueName
          visible
          replaceType
          customReplaceValue
          author {
            xid
            firstname
            lastname
          }
          editors {
            xid
            firstname
            lastname
          }
          lastUpdatedBy {
            xid
            firstname
            lastname
          }
          lastUpdated
          created
        }
        lastUpdatedBy {
          xid
          firstname
          lastname
        }
        lastUpdated
        created
      }
    }
  `;
}
