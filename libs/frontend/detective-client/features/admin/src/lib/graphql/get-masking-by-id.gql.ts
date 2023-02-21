import { Query, gql } from 'apollo-angular';
import { IMasking } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetMaskingByIdGQLResponse {
  getMasking: IMasking;
}

@Injectable()
export class GetMaskingByIdGQL extends Query<Response> {
  override document = gql`
    query getMaskingById($tenantId: String!, $maskingId: String!) {
      getMasking(xid: $maskingId) {
        id: xid
        name
        tenant(filter: { xid: { eq: $tenantId } }) {
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
