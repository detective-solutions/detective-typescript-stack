import { GetAllMaskingsGQL, IGetAllMaskingsGQLResponse } from '../graphql';
import { LogService, transformError } from '@detective.solutions/frontend/shared/error-handling';
import { Observable, catchError, map } from 'rxjs';

import { IGetAllMaskingsResponse } from '../models';
import { Injectable } from '@angular/core';
import { MaskingDTO } from '@detective.solutions/frontend/shared/data-access';
import { QueryRef } from 'apollo-angular';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';

@Injectable()
export class MaskingsService {
  private getAllMaskingsWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getAllMaskingsGQL: GetAllMaskingsGQL,
    private readonly tableCellEventService: TableCellEventService,
    private readonly logger: LogService
  ) {}

  getAllMaskings(paginationOffset: number, pageSize: number): Observable<IGetAllMaskingsResponse> {
    if (!this.getAllMaskingsWatchQuery) {
      this.getAllMaskingsWatchQuery = this.getAllMaskingsGQL.watch(
        {
          paginationOffset: paginationOffset,
          pageSize: pageSize,
        },
        { pollInterval: 10000 }
      );
    }

    return this.getAllMaskingsWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetAllMaskingsGQLResponse) => {
        return {
          maskings: response.queryMasking.map(MaskingDTO.Build),
          totalElementsCount: response.aggregateMasking.count,
        };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  refreshMaskings() {
    const currentResult = this.getAllMaskingsWatchQuery.getCurrentResult()?.data as any;
    const alreadyLoadedMaskingCount = (currentResult as IGetAllMaskingsGQLResponse)?.queryMasking?.length;
    if (alreadyLoadedMaskingCount) {
      this.getAllMaskingsWatchQuery.refetch({ paginationOffset: 0, pageSize: alreadyLoadedMaskingCount });
    } else {
      this.logger.error('Could not determine currently loaded masking count. Reusing values of last query...');
      this.getAllMaskingsWatchQuery.refetch();
    }
  }

  getAllMaskingsNextPage(paginationOffset: number, pageSize: number) {
    this.getAllMaskingsWatchQuery
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
