import { Query, gql } from 'apollo-angular';
import { CasefileDTO } from '@detective.solutions/frontend/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetAllCasefilesGQLResponse {
  queryCasefile: CasefileDTO[];
  aggregateCasefile: { count: number };
}

@Injectable()
export class GetAllCasefilesGQL extends Query<Response> {
  override document = gql`
    query casefiles($paginationOffset: Int!, $pageSize: Int!) {
      queryCasefile(offset: $paginationOffset, first: $pageSize, order: { asc: title }) {
        id: xid
        title
        description
        thumbnail
        author {
          firstname
          lastname
        }
        views
        lastUpdated
      }
      aggregateCasefile {
        count
      }
    }
  `;
}
