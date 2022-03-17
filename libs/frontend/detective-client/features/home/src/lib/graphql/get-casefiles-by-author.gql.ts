import { Query, gql } from 'apollo-angular';
import { Casefile } from '@detective.solutions/frontend/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetCasefilesByAuthorGQLResponse {
  queryCasefile: Casefile[];
  aggregateCasefile: { count: number };
}

@Injectable()
export class GetCasefilesByAuthorGQL extends Query<Response> {
  override document = gql`
    query getCasefilesByAuthor($paginationOffset: Int, $pageSize: Int, $userId: ID!) {
      queryCasefile(offset: $paginationOffset, first: $pageSize, filter: { has: "author" })
        @cascade(fields: ["author"]) {
        id
        title
        description
        thumbnailSrc
        author(filter: { id: [$userId] }) {
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
