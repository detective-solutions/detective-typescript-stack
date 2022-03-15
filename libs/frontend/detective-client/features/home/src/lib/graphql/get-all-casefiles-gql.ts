import { Query, gql } from 'apollo-angular';
import { Casefile } from '@detective.solutions/frontend/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetAllCasefilesGQLResponse {
  queryCasefile: Casefile[];
  aggregateCasefile: { count: number };
}

@Injectable()
export class GetAllCasefilesGQL extends Query<Response> {
  override document = gql`
    query casefiles($paginationOffset: Int, $pageSize: Int) {
      queryCasefile(offset: $paginationOffset, first: $pageSize) {
        title
        description
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
