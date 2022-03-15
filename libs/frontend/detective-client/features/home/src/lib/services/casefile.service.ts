import { Casefile, EventService } from '@detective.solutions/frontend/shared/data-access';
import { GetAllCasefilesGQL, IGetAllCasefilesGQLResponse } from '../graphql/get-all-casefiles-gql';
import { Observable, catchError, map } from 'rxjs';

import { IGetAllCasefilesResponse } from '../interfaces/get-all-casefiles-response.interface';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { transformError } from '@detective.solutions/frontend/shared/error-handling';

@Injectable()
export class CasefileService {
  private casefileWatchQuery!: QueryRef<Response>;

  constructor(private readonly getAllCasefileGQL: GetAllCasefilesGQL, private readonly eventService: EventService) {}

  getAllCasefiles(paginationOffset: number, pageSize: number): Observable<IGetAllCasefilesResponse> {
    this.casefileWatchQuery = this.getAllCasefileGQL.watch({ paginationOffset: paginationOffset, pageSize: pageSize });
    return this.casefileWatchQuery.valueChanges.pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((response: any) => response.data),
      map((response: IGetAllCasefilesGQLResponse) => {
        return {
          casefiles: response.queryCasefile.map(Casefile.Build),
          totalElementsCount: response.aggregateCasefile.count,
        };
      }),
      catchError((error) => {
        this.eventService.resetLoadingStates$.next(true);
        return transformError(error);
      })
    );
  }

  updateCasefiles(paginationOffset: number, pageSize: number) {
    this.casefileWatchQuery
      .fetchMore({
        variables: { paginationOffset: paginationOffset, pageSize: pageSize },
      })
      .catch((error) => {
        this.eventService.resetLoadingStates$.next(true);
        transformError(error);
      });
  }
}
