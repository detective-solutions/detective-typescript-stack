import { BehaviorSubject, Observable, catchError, filter, map, mergeMap, tap, throwError } from 'rxjs';
import { IAuthStatus, defaultAuthStatus } from '../interfaces/auth-status.interface';

import { CacheService } from './cache.service';
import { IAuthServerResponse } from '../interfaces/auth-server-response.interface';
import { IAuthService } from '../interfaces/auth-service.interface';
import { IUser } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';
import { User } from '@detective.solutions/frontend/shared/data-access';
import jwtDecode from 'jwt-decode';
import { transformError } from '@detective.solutions/frontend/shared/utils';

@Injectable()
export abstract class AuthService extends CacheService implements IAuthService {
  readonly authStatus$ = new BehaviorSubject<IAuthStatus>(defaultAuthStatus);
  readonly currentUser$ = new BehaviorSubject<IUser>(new User());

  constructor() {
    super();
  }

  protected abstract authProvider(email: string, password: string): Observable<IAuthServerResponse>;
  protected abstract transformJwtToken(token: unknown): IAuthStatus;
  protected abstract getCurrentUser(): Observable<User>;

  login(email: string, password: string): Observable<void> {
    this.clearToken();

    const loginResponse$ = this.authProvider(email, password).pipe(
      map((value) => {
        this.setToken(value.accessToken);
        return this.transformJwtToken(jwtDecode(value.accessToken));
      }),
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

  logout(clearToken?: boolean) {
    if (clearToken) {
      this.clearToken();
    }
    setTimeout(() => this.authStatus$.next(defaultAuthStatus), 0);
  }

  protected setToken(jwt: string) {
    this.setItem('jwt', jwt);
  }

  getToken(): string {
    return this.getItem('jwt') ?? '';
  }

  protected clearToken() {
    this.removeItem('jwt');
  }
}
