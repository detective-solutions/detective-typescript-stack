import { Query, gql } from 'apollo-angular';
import { CasefileDTO } from '@detective.solutions/frontend/shared/data-access';
import { Injectable } from '@angular/core';

export interface IGetCasefilesByAuthorGQLResponse {
  queryCasefile: CasefileDTO[];
  aggregateCasefile: { count: number };
}

@Injectable()
export class GetCasefilesByAuthorGQL extends Query<Response> {
  override document = gql`
    query getCasefilesByAuthor($paginationOffset: Int!, $pageSize: Int!, $userId: String!) {
      queryCasefile(offset: $paginationOffset, first: $pageSize, order: { asc: title }) @cascade(fields: ["author"]) {
        id: xid
        title
        description
        thumbnail
        author(filter: { xid: { eq: $userId } }) {
          xid
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
