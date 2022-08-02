import { IAuthServerResponse, IJwtTokenPayload, UserRole } from '@detective.solutions/shared/data-access';
import { Observable, tap } from 'rxjs';

import { $enum } from 'ts-enum-util';
import { Apollo } from 'apollo-angular';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { IAuthStatus } from '../interfaces/auth-status.interface';
import { Injectable } from '@angular/core';
import { environment } from '@detective.solutions/frontend/shared/environments';

// Custom implementation of abstract AuthService to communicate with detective.solutions AuthService backend
@Injectable()
export class CustomAuthService extends AuthService {
  private static readonly apiPathV1 = environment.baseApiPath + environment.authApiPathV1;

  private readonly loginUrl = `${CustomAuthService.apiPathV1}/login`;
  private readonly logoutUrl = `${CustomAuthService.apiPathV1}/logout`;
  private readonly refreshUrl = `${CustomAuthService.apiPathV1}/refresh`;

  constructor(private readonly httpClient: HttpClient, private readonly apollo: Apollo) {
    super();
  }

  protected loginProvider(email: string, password: string): Observable<IAuthServerResponse> {
    return this.httpClient
      .post<IAuthServerResponse>(this.loginUrl, {
        email,
        password,
        // Reset Apollo DB cache on login
      })
      .pipe(tap(() => this.apollo.client.resetStore()));
  }

  protected logoutProvider(): Observable<void> {
    // Additionally resets Apollo DB cache on logout
    return this.httpClient.post<void>(this.logoutUrl, {}).pipe(tap(() => this.apollo.client.resetStore()));
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
}
