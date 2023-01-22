import { BehaviorSubject, Observable, catchError, map } from 'rxjs';
import {
  CreateUserGroupGQL,
  DeleteUserGroupGQL,
  GetAllUserGroupsGQL,
  GetAllUsersGQL,
  GetMaskingByUserGroupIdGQL,
  GetUserGroupByIdGQL,
  ICreateUserGroupGQLResponse,
  IDeleteUserGroupGQLResponse,
  IGetMaskingByUserGroupIdGQLResponse,
  IGetUserGroupByIdGQLResponse,
  IGetUserGroupsGQLResponse,
  IGetUsersGQLResponse,
  IUpdateUserGroupGQLResponse,
  UpdateUserGroupGQL,
} from '../graphql';
import { IGetAllUsersResponse, UserGroupCreateInput, UserGroupEditInput } from '../models';
import { IJwtTokenPayload, IMasking, IUserGroup } from '@detective.solutions/shared/data-access';
import { LogService, transformError } from '@detective.solutions/frontend/shared/error-handling';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { IGetAllUserGroupsResponse } from '../models/get-all-user-groups-response.interface';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';
import { UserDTO } from '@detective.solutions/frontend/shared/data-access';
import jwtDecode from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class UsersService {
  readonly isLoading$ = new BehaviorSubject<boolean>(false);

  private getAllUsersWatchQuery!: QueryRef<Response>;
  private getAllUserGroupsWatchQuery!: QueryRef<Response>;
  private getUserGroupByIdWatchQuery!: QueryRef<Response>;
  private getMaskingsOfUserGroupWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getAllUserGroupsGQL: GetAllUserGroupsGQL,
    private readonly getUserGroupByIdGQL: GetUserGroupByIdGQL,
    private readonly getAllUsersGQL: GetAllUsersGQL,
    private readonly createUserGroupGQL: CreateUserGroupGQL,
    private readonly updateUserGroupGQL: UpdateUserGroupGQL,
    private readonly authService: AuthService,
    private readonly deleteUserGroupGQL: DeleteUserGroupGQL,
    private readonly getMaskingsOfUserGroupById: GetMaskingByUserGroupIdGQL,
    private readonly tableCellEventService: TableCellEventService,
    private readonly logger: LogService
  ) {}

  getAuthor(): string {
    const stringToken: string = this.authService.getAccessToken();
    const objectToken: IJwtTokenPayload = jwtDecode(stringToken);
    return objectToken.sub;
  }

  getTenant(): string {
    const stringToken: string = this.authService.getAccessToken();
    const objectToken: IJwtTokenPayload = jwtDecode(stringToken);
    return objectToken.tenantId;
  }

  getAllUsers(paginationOffset: number, pageSize: number): Observable<IGetAllUsersResponse> {
    if (!this.getAllUsersWatchQuery) {
      this.getAllUsersWatchQuery = this.getAllUsersGQL.watch(
        {
          id: this.getTenant(),
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

  getAllUserGroups(paginationOffset: number, pageSize: number): Observable<IGetAllUserGroupsResponse> {
    if (!this.getAllUserGroupsWatchQuery) {
      this.getAllUserGroupsWatchQuery = this.getAllUserGroupsGQL.watch(
        {
          id: this.getTenant(),
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
          userGroup: response.queryUserGroup,
          totalElementsCount: response.aggregateUserGroup.count,
        };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getUserGroupById(userGroupId: string): Observable<IUserGroup> {
    this.getUserGroupByIdWatchQuery = this.getUserGroupByIdGQL.watch({ userGroupId });
    return this.getUserGroupByIdWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetUserGroupByIdGQLResponse) => {
        return response.getUserGroup;
      })
    );
  }

  deleteUserGroup(userGroupId: string): Observable<IDeleteUserGroupGQLResponse> {
    return this.deleteUserGroupGQL
      .mutate(
        {
          filter: {
            xid: {
              eq: userGroupId,
            },
          },
        },
        {
          refetchQueries: [
            { query: this.getAllUserGroupsGQL.document, variables: { paginationOffset: 0, pageSize: 100 } },
          ],
        }
      )
      .pipe(
        map((response: any) => response.data),
        map((response: IDeleteUserGroupGQLResponse) => response)
      );
  }

  updateUserGroup(update: UserGroupEditInput): Observable<IUpdateUserGroupGQLResponse> {
    const user = this.getAuthor();
    const date = new Date().toISOString();

    const userGroup = update;
    userGroup.lastUpdated = date;
    userGroup.lastUpdatedBy = { id: user };

    return this.updateUserGroupGQL
      .mutate(
        {
          patch: {
            filter: {
              xid: {
                eq: update.id,
              },
            },
            set: {
              name: update.name,
              description: update.description,
              members: update.members,
              lastUpdatedBy: {
                xid: user,
              },
              lastUpdated: date,
            },
            remove: {
              members: update.toDeleteMembers,
            },
          },
        },
        {
          refetchQueries: [
            { query: this.getUserGroupByIdGQL.document, variables: { id: update.id } },
            { query: this.getAllUserGroupsGQL.document, variables: { paginationOffset: 0, pageSize: 100 } },
          ],
        }
      )
      .pipe(
        map((response: any) => response.data),
        map((response: IUpdateUserGroupGQLResponse) => response)
      );
  }

  createUserGroup(payload: UserGroupCreateInput): Observable<ICreateUserGroupGQLResponse> {
    const user = this.getAuthor();
    const tenant = this.getTenant();
    const date = new Date().toISOString();

    const userGroup = payload;

    userGroup.id = uuidv4();
    userGroup.author = { id: user };
    userGroup.lastUpdated = date;
    userGroup.tenant = { id: tenant };
    userGroup.lastUpdatedBy = { id: user };
    userGroup.created = date;

    return this.createUserGroupGQL
      .mutate(
        {
          userGroup: userGroup,
        },
        {
          refetchQueries: [
            { query: this.getAllUserGroupsGQL.document, variables: { paginationOffset: 0, pageSize: 100 } },
          ],
        }
      )
      .pipe(
        map((response: any) => response.data),
        map((response: ICreateUserGroupGQLResponse) => response)
      );
  }

  getMaskingsOfUserGroup(userGroupId: string): Observable<IMasking[]> {
    this.getMaskingsOfUserGroupWatchQuery = this.getMaskingsOfUserGroupById.watch({ userGroupId });
    return this.getMaskingsOfUserGroupWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetMaskingByUserGroupIdGQLResponse) => response.queryMasking)
    );
  }

  refreshUserGroups() {
    const currentResult = this.getAllUserGroupsWatchQuery.getCurrentResult()?.data as any;
    const alreadyLoadedUserGroupCount = (currentResult as IGetUserGroupsGQLResponse)?.queryUserGroup?.length;
    if (alreadyLoadedUserGroupCount) {
      this.getAllUserGroupsWatchQuery.refetch({
        id: this.getTenant(),
        paginationOffset: 0,
        pageSize: alreadyLoadedUserGroupCount,
      });
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
