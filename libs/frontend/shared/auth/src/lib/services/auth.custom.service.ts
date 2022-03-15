import { GetUserGQL, IGetCurrentUserGQLResponse } from '../graphql/get-user-gql';
import { IAuthServerResponse, IJwtTokenPayload, UserRole } from '@detective.solutions/shared/data-access';
import { Observable, catchError, map } from 'rxjs';

import { $enum } from 'ts-enum-util';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { IAuthStatus } from '../interfaces/auth-status.interface';
import { Injectable } from '@angular/core';
import { User } from '@detective.solutions/frontend/shared/data-access';
import { environment } from '@detective.solutions/frontend/shared/environments';
import { transformError } from '@detective.solutions/frontend/shared/error-handling';

// Custom implementation of abstract AuthService to communicate with detective.solutions AuthService backend
@Injectable()
export class CustomAuthService extends AuthService {
  private readonly loginUrl = `${environment.baseUrl}/v1/auth/login`;
  private readonly logoutUrl = `${environment.baseUrl}/v1/auth/logout`;
  private readonly refreshUrl = `${environment.baseUrl}/v1/auth/refresh`;

  constructor(private readonly httpClient: HttpClient, private readonly getUserGQL: GetUserGQL) {
    super();
  }

  protected loginProvider(email: string, password: string): Observable<IAuthServerResponse> {
    return this.httpClient.post<IAuthServerResponse>(this.loginUrl, {
      email,
      password,
    });
  }

  protected logoutProvider(): Observable<void> {
    return this.httpClient.post<void>(this.logoutUrl, {});
  }

  protected refreshProvider(): Observable<IAuthServerResponse> {
    return this.httpClient.post<IAuthServerResponse>(this.refreshUrl, {});
  }

  protected transformJwtToken(token: IJwtTokenPayload): IAuthStatus {
    return {
      isAuthenticated: token.sub ? true : false,
      userId: token.sub,
      tenantId: token.tenantId,
      userRole: $enum(UserRole).asValueOrDefault(token.role, UserRole.NONE),
    } as IAuthStatus;
  }

  protected getCurrentUser(userId: string): Observable<User> {
    return this.getUserGQL.fetch({ userId: userId }).pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((response: any) => response?.data),
      map((response: IGetCurrentUserGQLResponse) => response.getUser),
      map(User.Build),
      catchError(transformError)
    );
  }
}
