import { Casefile, EventService } from '@detective.solutions/frontend/shared/data-access';
import { GetAllCasefilesGQL, IGetAllCasefilesGQLResponse } from '../graphql/get-all-casefiles-gql';
import { GetCasefilesByAuthorGQL, IGetCasefilesByAuthorGQLResponse } from '../graphql/get-casefiles-by-author.gql';
import { Observable, catchError, map, tap } from 'rxjs';

import { IGetAllCasefilesResponse } from '../interfaces/get-all-casefiles-response.interface';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { transformError } from '@detective.solutions/frontend/shared/error-handling';

@Injectable()
export class CasefileService {
  private getAllCasefilesWatchQuery!: QueryRef<Response>;
  private getCasefilesByAuthorWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getAllCasefileGQL: GetAllCasefilesGQL,
    private readonly getCasefilesByAuthorGQL: GetCasefilesByAuthorGQL,
    private readonly eventService: EventService
  ) {}

  getAllCasefiles(paginationOffset: number, pageSize: number): Observable<IGetAllCasefilesResponse> {
    this.getAllCasefilesWatchQuery = this.getAllCasefileGQL.watch({
      paginationOffset: paginationOffset,
      pageSize: pageSize,
    });
    return this.getAllCasefilesWatchQuery.valueChanges.pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((response: any) => response.data),
      map((response: IGetAllCasefilesGQLResponse) => {
        return {
          casefiles: response.queryCasefile.map(Casefile.Build),
          totalElementsCount: response.aggregateCasefile.count,
        };
      }),
      catchError(this.handleError)
    );
  }

  getAllCasefilesNextPage(paginationOffset: number, pageSize: number) {
    this.getAllCasefilesWatchQuery
      .fetchMore({
        variables: { paginationOffset: paginationOffset, pageSize: pageSize },
      })
      .catch(this.handleError);
  }

  getCasefilesByAuthor(paginationOffset: number, pageSize: number, userId: string) {
    this.getCasefilesByAuthorWatchQuery = this.getCasefilesByAuthorGQL.watch({
      paginationOffset: paginationOffset,
      pageSize: pageSize,
      userId: userId,
    });
    return this.getCasefilesByAuthorWatchQuery.valueChanges.pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((response: any) => response.data),
      map((response: IGetCasefilesByAuthorGQLResponse) => {
        return {
          casefiles: response.queryCasefile.map(Casefile.Build),
          totalElementsCount: response.aggregateCasefile.count,
        };
      }),
      catchError(this.handleError)
    );
  }

  getCasefilesByAuthorNextPage(paginationOffset: number, pageSize: number) {
    this.getCasefilesByAuthorWatchQuery
      .fetchMore({
        variables: { paginationOffset: paginationOffset, pageSize: pageSize },
      })
      .catch(this.handleError);
  }

  private handleError(error: string) {
    this.eventService.resetLoadingStates$.next(true);
    return transformError(error);
  }
}
