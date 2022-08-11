import {
  GetAllCasefilesGQL,
  GetCasefilesByAuthorGQL,
  IGetAllCasefilesGQLResponse,
  IGetCasefilesByAuthorGQLResponse,
} from '../graphql';
import { Observable, catchError, map } from 'rxjs';

import { IGetAllCasefilesResponse } from '../interfaces';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';
import { transformError } from '@detective.solutions/frontend/shared/error-handling';

@Injectable()
export class CasefileService {
  private getAllCasefilesWatchQuery!: QueryRef<Response>;
  private getCasefilesByAuthorWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getAllCasefileGQL: GetAllCasefilesGQL,
    private readonly getCasefilesByAuthorGQL: GetCasefilesByAuthorGQL,
    private readonly tableCellEventService: TableCellEventService
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
          casefiles: response.queryCasefile,
          totalElementsCount: response.aggregateCasefile.count,
        };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getAllCasefilesNextPage(paginationOffset: number, pageSize: number) {
    this.getAllCasefilesWatchQuery
      .fetchMore({
        variables: { paginationOffset: paginationOffset, pageSize: pageSize },
      })
      .catch((error) => this.handleError(error));
  }

  getCasefilesByAuthor(
    paginationOffset: number,
    pageSize: number,
    userId: string
  ): Observable<IGetAllCasefilesResponse> {
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
          casefiles: response.queryCasefile,
          totalElementsCount: response.aggregateCasefile.count,
        };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getCasefilesByAuthorNextPage(paginationOffset: number, pageSize: number) {
    this.getCasefilesByAuthorWatchQuery
      .fetchMore({
        variables: { paginationOffset: paginationOffset, pageSize: pageSize },
      })
      .catch((error) => this.handleError(error));
  }

  private handleError(error: string) {
    this.tableCellEventService.resetLoadingStates$.next(true);
    return transformError(error);
  }
}
