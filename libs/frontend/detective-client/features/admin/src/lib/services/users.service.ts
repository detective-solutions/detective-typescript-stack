import { GetMaskingByUserGroupIdGQL, IGetMaskingByUserGroupIdGQLResponse } from '../graphql';
import { IJwtTokenPayload, IMasking } from '@detective.solutions/shared/data-access';
import { Observable, map } from 'rxjs';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { Injectable } from '@angular/core';
import { QueryRef } from 'apollo-angular';
import jwtDecode from 'jwt-decode';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class UsersService {
  private getMaskingsOfUserGroupWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly authService: AuthService,
    private readonly getMaskingsOfUserGroupById: GetMaskingByUserGroupIdGQL
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

  getMaskingsOfUserGroup(userGroupId: string): Observable<IMasking[]> {
    this.getMaskingsOfUserGroupWatchQuery = this.getMaskingsOfUserGroupById.watch({ userGroupId });
    return this.getMaskingsOfUserGroupWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetMaskingByUserGroupIdGQLResponse) => response.queryMasking)
    );
  }
}
