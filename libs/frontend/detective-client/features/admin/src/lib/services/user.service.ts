import {
  CreateUserGroupGQL,
  DeleteUserGQL,
  DeleteUserGroupGQL,
  GetAllUserGroupsGQL,
  GetAllUsersGQL,
  GetMaskingByUserGroupIdGQL,
  GetUserByIdGQL,
  GetUserGroupByIdGQL,
  ICreateUserGroupGQLResponse,
  IDeleteUserGQLResponse,
  IDeleteUserGroupGQLResponse,
  IGetMaskingByUserGroupIdGQLResponse,
  IGetUserByIdGQLResponse,
  IGetUserGroupByIdGQLResponse,
  IGetUserGroupsGQLResponse,
  IGetUsersGQLResponse,
  IUpdateUserGroupGQLResponse,
  IUpdateUserRoleGQLResponse,
  UpdateUserGroupGQL,
  UpdateUserRoleGQL,
} from '../graphql';
import { IGetAllUsersResponse, UserGroupCreateInput, UserGroupEditInput } from '../models';
import { IJwtTokenPayload, IUser, IUserGroup } from '@detective.solutions/shared/data-access';
import { LogService, transformError } from '@detective.solutions/frontend/shared/error-handling';
import { MaskingDTO, UserDTO } from '@detective.solutions/frontend/shared/data-access';
import { Observable, catchError, map } from 'rxjs';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { IGetAllUserGroupsResponse } from '../models/get-all-user-groups-response.interface';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';
import jwtDecode from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class UsersService {
  private getAllUserGroupsWatchQuery!: QueryRef<Response>;
  private getAllUsersWatchQuery!: QueryRef<Response>;
  private getUserByIdWatchQuery!: QueryRef<Response>;
  private getMaskingsOfUserGroupWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getAllUserGroupsGQL: GetAllUserGroupsGQL,
    private readonly getUserGroupByIdGQL: GetUserGroupByIdGQL,
    private readonly getAllUsersGQL: GetAllUsersGQL,
    private readonly getUserByIdGQL: GetUserByIdGQL,
    private readonly deleteUserGQL: DeleteUserGQL,
    private readonly createUserGroupGQL: CreateUserGroupGQL,
    private readonly updateUserGroupGQL: UpdateUserGroupGQL,
    private readonly authService: AuthService,
    private readonly deleteUserGroupGQL: DeleteUserGroupGQL,
    private readonly updateUserRoleGQL: UpdateUserRoleGQL,
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
          xid: this.getTenant(),
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

  getUserById(id: string): Observable<IUser> {
    this.getUserByIdWatchQuery = this.getUserByIdGQL.watch({ id: id });
    return this.getUserByIdWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetUserByIdGQLResponse) => response.getUser)
    );
  }

  updateUserRole(id: string, roleData: { role: string; lastUpdated: string }): Observable<IUpdateUserRoleGQLResponse> {
    return this.updateUserRoleGQL
      .mutate(
        {
          patch: {
            filter: {
              xid: {
                eq: id,
              },
            },
            set: roleData,
          },
        },
        {
          refetchQueries: [{ query: this.getAllUsersGQL.document, variables: { paginationOffset: 0, pageSize: 100 } }],
        }
      )
      .pipe(
        map((response: any) => response.data),
        map((response: IUpdateUserRoleGQLResponse) => response)
      );
  }

  deleteUser(id: string): Observable<IDeleteUserGQLResponse> {
    return this.deleteUserGQL
      .mutate(
        {
          filter: {
            xid: {
              eq: id,
            },
          },
        },
        {
          refetchQueries: [{ query: this.getAllUsersGQL.document, variables: { paginationOffset: 0, pageSize: 100 } }],
        }
      )
      .pipe(
        map((response: any) => response.data),
        map((response: IDeleteUserGQLResponse) => response)
      );
  }

  refreshUsers() {
    const currentResult = this.getAllUsersWatchQuery.getCurrentResult()?.data as any;
    const alreadyLoadedUserCount = (currentResult as IGetUsersGQLResponse)?.queryUser?.length;
    if (alreadyLoadedUserCount) {
      this.getAllUsersWatchQuery.refetch({
        xid: this.getTenant(),
        paginationOffset: 0,
        pageSize: alreadyLoadedUserCount,
      });
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
          xid: this.getTenant(),
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

  getUserGroupById(xid: string): Observable<IUserGroup> {
    this.getUserByIdWatchQuery = this.getUserGroupByIdGQL.watch({ xid: xid });
    return this.getUserByIdWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetUserGroupByIdGQLResponse) => {
        return response.getUserGroup;
      })
    );
  }

  deleteUserGroup(id: string): Observable<IDeleteUserGroupGQLResponse> {
    return this.deleteUserGroupGQL
      .mutate(
        {
          filter: {
            xid: {
              eq: id,
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
    userGroup.lastUpdatedBy = { xid: user };

    return this.updateUserGroupGQL
      .mutate(
        {
          patch: {
            filter: {
              xid: {
                eq: update.xid,
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
            { query: this.getUserGroupByIdGQL.document, variables: { xid: update.xid } },
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

    userGroup.xid = uuidv4();
    userGroup.author = { xid: user };
    userGroup.lastUpdated = date;
    userGroup.tenant = { xid: tenant };
    userGroup.lastUpdatedBy = { xid: user };
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

  getMaskingsOfUserGroup(xid: string): Observable<MaskingDTO> {
    this.getMaskingsOfUserGroupWatchQuery = this.getMaskingsOfUserGroupById.watch({ xid: xid });
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
        xid: this.getTenant(),
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
