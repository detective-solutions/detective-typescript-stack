import { DropDownValuesDTO, MaskingDTO } from '@detective.solutions/frontend/shared/data-access';
import { GetAllMaskingsGQL, IGetAllMaskingsGQLResponse } from '../graphql';
import { GetAllUserGroupsGQL, IGetUserGroupsGQLResponse } from '../graphql/get-all-user-groups.gql';
import { GetMaskingByIdGQL, IGetMaskingByIdGQLResponse } from '../graphql/get-masking-by-id.gql';
import { LogService, transformError } from '@detective.solutions/frontend/shared/error-handling';
import { Observable, catchError, map } from 'rxjs';

import { IDropDownValues } from '@detective.solutions/shared/data-access';
import { IGetAllMaskingsResponse } from '../models';
import { IGetMaskingByIdResponse } from '../models/get-masking-by-id-response.interface';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class MaskingService {
  private getMaskingByIdWatchQuery!: QueryRef<Response>;
  private getAllMaskingWatchQuery!: QueryRef<Response>;
  private getUserGroupsWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getMaskingByIdGQL: GetMaskingByIdGQL,
    private readonly getAllMaskingGQL: GetAllMaskingsGQL,
    private readonly getUserGroupsGQL: GetAllUserGroupsGQL,
    private readonly tableCellEventService: TableCellEventService,
    private readonly logger: LogService
  ) {}

  getMaskingById(id: string): Observable<IGetMaskingByIdResponse> {
    this.getMaskingByIdWatchQuery = this.getMaskingByIdGQL.watch({ id: id });
    return this.getMaskingByIdWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetMaskingByIdGQLResponse) => response.getMasking)
    );
  }

  getAllMaskings(paginationOffset: number, pageSize: number): Observable<IGetAllMaskingsResponse> {
    if (!this.getAllMaskingWatchQuery) {
      this.getAllMaskingWatchQuery = this.getAllMaskingGQL.watch(
        {
          paginationOffset: paginationOffset,
          pageSize: pageSize,
        },
        { pollInterval: 10000 }
      );
    }

    return this.getAllMaskingWatchQuery.valueChanges.pipe(
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

  getAvailableUserGroups(): Observable<IDropDownValues[]> {
    if (!this.getUserGroupsWatchQuery) {
      this.getUserGroupsWatchQuery = this.getUserGroupsGQL.watch(
        {
          paginationOffset: 0,
          pageSize: 10000,
        },
        { pollInterval: 10000 }
      );
    }

    return this.getUserGroupsWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetUserGroupsGQLResponse) => {
        return response.queryUserGroup.map(DropDownValuesDTO.Build);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  refreshMaskings() {
    const currentResult = this.getAllMaskingWatchQuery.getCurrentResult()?.data as any;
    const alreadyLoadedMaskingCount = (currentResult as IGetAllMaskingsGQLResponse)?.queryMasking?.length;
    if (alreadyLoadedMaskingCount) {
      this.getAllMaskingWatchQuery.refetch({ paginationOffset: 0, pageSize: alreadyLoadedMaskingCount });
    } else {
      this.logger.error('Could not determine currently loaded masking count. Reusing values of last query...');
      this.getAllMaskingWatchQuery.refetch();
    }
  }

  deleteMasking(maskingId: string, maskingName: string): void {
    console.log(`${maskingId}: ${maskingName} deleted`);
  }

  getAllMaskingsNextPage(paginationOffset: number, pageSize: number) {
    this.getAllMaskingWatchQuery
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
