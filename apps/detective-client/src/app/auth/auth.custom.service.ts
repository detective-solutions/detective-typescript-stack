import { IAuthServerResponse, IJwtTokenPayload, IUser, UserRole } from '@detective.solutions/shared/data-access';
import { Observable, catchError, map } from 'rxjs';

import { $enum } from 'ts-enum-util';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@detective.solutions/frontend/shared/data-access';
import { environment } from '@detective.solutions/frontend/shared/environments';
import { transformError } from '@detective.solutions/frontend/shared/utils';

@Injectable()
export class CustomAuthService extends AuthService {
  private readonly loginApiUrl = `${environment.baseUrl}/v1/auth/login`;
  private readonly userApiUrl = `${environment.baseUrl}/v1/auth/me`;

  constructor(private httpClient: HttpClient) {
    super();
  }

  protected authProvider(email: string, password: string): Observable<IAuthServerResponse> {
    return this.httpClient.post<IAuthServerResponse>(this.loginApiUrl, {
      email,
      password,
    });
  }

  protected transformJwtToken(token: IJwtTokenPayload): IAuthStatus {
    return {
      isAuthenticated: token.sub ? true : false,
      userId: token.sub,
      userRole: $enum(UserRole).asValueOrDefault(token.role, UserRole.NONE),
    } as IAuthStatus;
  }

  protected getCurrentUser(): Observable<User> {
    // this.getUserGQL.watch().valueChanges.subscribe((val) => console.log('RESPONSE:', val.data));
    // return of(new User('john.doe@detective.solutions'));
    return this.httpClient.get<IUser>(this.userApiUrl).pipe(map(User.Build), catchError(transformError));
  }
}
