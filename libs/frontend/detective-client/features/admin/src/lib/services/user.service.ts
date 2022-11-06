import { GetAllUserGroupsGQL, GetAllUsersGQL, IGetUserGroupsGQLResponse, IGetUsersGQLResponse } from '../graphql';
import { LogService, transformError } from '@detective.solutions/frontend/shared/error-handling';
import { Observable, catchError, map } from 'rxjs';
import { UserDTO, UserGroupDTO } from '@detective.solutions/frontend/shared/data-access';

import { IGetAllUserGroupsResponse } from '../models/get-all-user-groups-response.interface';
import { IGetAllUsersResponse } from '../models';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class UsersService {
  private getAllUserGroupsWatchQuery!: QueryRef<Response>;
  private getAllUsersWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getAllUserGroupsGQL: GetAllUserGroupsGQL,
    private readonly getAllUsersGQL: GetAllUsersGQL,
    private readonly tableCellEventService: TableCellEventService,
    private readonly logger: LogService
  ) {}

  getAllUsers(paginationOffset: number, pageSize: number): Observable<IGetAllUsersResponse> {
    if (!this.getAllUsersWatchQuery) {
      this.getAllUsersWatchQuery = this.getAllUsersGQL.watch(
        {
          paginationOffset: paginationOffset,
          pageSize: pageSize,
        },
        { pollInterval: 10000 }
      );
    }

    return this.getAllUsersWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetUsersGQLResponse) => {
        return {
          users: response.queryUser.map(UserDTO.Build),
          totalElementsCount: response.aggregateUser.count,
        };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  refreshUsers() {
    const currentResult = this.getAllUsersWatchQuery.getCurrentResult()?.data as any;
    const alreadyLoadedUserCount = (currentResult as IGetUsersGQLResponse)?.queryUser?.length;
    if (alreadyLoadedUserCount) {
      this.getAllUsersWatchQuery.refetch({ paginationOffset: 0, pageSize: alreadyLoadedUserCount });
    } else {
      this.logger.error('Could not determine currently loaded masking count. Reusing values of last query...');
      this.getAllUsersWatchQuery.refetch();
    }
  }

  getAllUsersNextPage(paginationOffset: number, pageSize: number) {
    this.getAllUsersWatchQuery
      .fetchMore({
        variables: { paginationOffset: paginationOffset, pageSize: pageSize },
      })
      .catch((error) => this.handleError(error));
  }

  getAllUserGroups(paginationOffset: number, pageSize: number): Observable<IGetAllUserGroupsResponse> {
    if (!this.getAllUserGroupsWatchQuery) {
      this.getAllUserGroupsWatchQuery = this.getAllUserGroupsGQL.watch(
        {
          paginationOffset: paginationOffset,
          pageSize: pageSize,
        },
        { pollInterval: 10000 }
      );
    }

    return this.getAllUserGroupsWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetUserGroupsGQLResponse) => {
        return {
          userGroups: response.queryUserGroup.map(UserGroupDTO.Build),
          totalElementsCount: response.aggregateUserGroup.count,
        };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  refreshUserGroups() {
    const currentResult = this.getAllUserGroupsWatchQuery.getCurrentResult()?.data as any;
    const alreadyLoadedUserGroupCount = (currentResult as IGetUserGroupsGQLResponse)?.queryUserGroup?.length;
    if (alreadyLoadedUserGroupCount) {
      this.getAllUserGroupsWatchQuery.refetch({ paginationOffset: 0, pageSize: alreadyLoadedUserGroupCount });
    } else {
      this.logger.error('Could not determine currently loaded masking count. Reusing values of last query...');
      this.getAllUserGroupsWatchQuery.refetch();
    }
  }

  getAllUserGroupsNextPage(paginationOffset: number, pageSize: number) {
    this.getAllUserGroupsWatchQuery
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
