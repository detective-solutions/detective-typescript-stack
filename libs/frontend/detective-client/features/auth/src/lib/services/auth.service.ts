import { BehaviorSubject, Observable, catchError, filter, map, mergeMap, tap, throwError } from 'rxjs';
import { IAuthStatus, defaultAuthStatus } from '../interfaces/auth-status.interface';

import { IAuthServerResponse } from '../interfaces/auth-server-response.interface';
import { IAuthService } from '../interfaces/auth-service.interface';
import { IUser } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';
import { User } from '@detective.solutions/frontend/shared/data-access';
import jwtDecode from 'jwt-decode';
import { transformError } from '@detective.solutions/frontend/shared/utils';

@Injectable()
export abstract class AuthService implements IAuthService {
  readonly authStatus$ = new BehaviorSubject<IAuthStatus>(defaultAuthStatus);
  readonly currentUser$ = new BehaviorSubject<IUser>(new User());

  protected abstract authProvider(email: string, password: string): Observable<IAuthServerResponse>;
  protected abstract transformJwtToken(token: unknown): IAuthStatus;
  protected abstract getCurrentUser(): Observable<User>;

  login(email: string, password: string): Observable<void> {
    const loginResponse$ = this.authProvider(email, password).pipe(
      map((value) => this.transformJwtToken(jwtDecode(value.accessToken))),
      tap((status) => this.authStatus$.next(status)),
      filter((status: IAuthStatus) => status.isAuthenticated),
      mergeMap(() => this.getCurrentUser()),
      map((user: IUser) => this.currentUser$.next(user)),
      catchError(transformError)
    );
    loginResponse$.subscribe({
      error: (err) => {
        this.logout();
        return throwError(() => new Error(err));
      },
    });
    return loginResponse$;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logout(clearToken?: boolean) {
    setTimeout(() => this.authStatus$.next(defaultAuthStatus), 0);
  }

  getToken() {
    return '';
  }
}
