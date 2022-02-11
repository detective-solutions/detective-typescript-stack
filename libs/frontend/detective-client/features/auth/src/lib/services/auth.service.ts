import { BehaviorSubject, Observable, catchError, filter, map, mergeMap, pipe, tap, throwError } from 'rxjs';
import { IAuthServerResponse, IJwtToken } from '@detective.solutions/shared/data-access';
import { IAuthStatus, defaultAuthStatus } from '../interfaces/auth-status.interface';

import { CacheService } from './cache.service';
import { IAuthService } from '../interfaces/auth-service.interface';
import { Injectable } from '@angular/core';
import { User } from '@detective.solutions/frontend/shared/data-access';
import jwtDecode from 'jwt-decode';
import { transformError } from '@detective.solutions/frontend/shared/utils';

@Injectable()
export abstract class AuthService extends CacheService implements IAuthService {
  protected static ACCESS_TOKEN_STORAGE_KEY = 'access_token';
  protected static REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

  private getAndUpdateUserIfAuthenticated = pipe(
    filter((status: IAuthStatus) => status.isAuthenticated),
    mergeMap(() => this.getCurrentUser()),
    map((user: User) => this.currentUser$.next(user)),
    catchError(transformError)
  );

  readonly authStatus$ = new BehaviorSubject<IAuthStatus>(defaultAuthStatus);
  readonly currentUser$ = new BehaviorSubject<User>(new User());
  protected readonly resumeCurrentUser$ = this.authStatus$.pipe(this.getAndUpdateUserIfAuthenticated);

  constructor() {
    super();
    if (this.hasExpiredToken()) {
      this.logout(true);
    } else {
      this.authStatus$.next(this.getAuthStatusFromToken());
      // Resume pipe must run on the next cycle to make sure all services are constructed correctly
      setTimeout(() => this.resumeCurrentUser$.subscribe());
    }
  }

  protected abstract authProvider(email: string, password: string): Observable<IAuthServerResponse>;
  protected abstract transformJwtToken(token: unknown): IAuthStatus;
  protected abstract getCurrentUser(): Observable<User>;

  login(email: string, password: string): Observable<void> {
    this.clearAuthTokens();

    const loginResponse$ = this.authProvider(email, password).pipe(
      map((response: IAuthServerResponse) => {
        this.setAuthTokens(response.access_token, response.refresh_token);
        return this.getAuthStatusFromToken();
      }),
      tap((status) => this.authStatus$.next(status)),
      this.getAndUpdateUserIfAuthenticated,
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
      this.clearAuthTokens();
    }
    setTimeout(() => this.authStatus$.next(defaultAuthStatus), 0);
  }

  protected setAuthTokens(accessToken: string, refreshToken: string) {
    this.setItem(AuthService.ACCESS_TOKEN_STORAGE_KEY, accessToken);
    this.setItem(AuthService.REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  getAccessToken(): string {
    return this.getItem(AuthService.ACCESS_TOKEN_STORAGE_KEY) ?? '';
  }

  getRefreshToken(): string {
    return this.getItem(AuthService.REFRESH_TOKEN_STORAGE_KEY) ?? '';
  }

  protected clearAuthTokens() {
    this.removeItem(AuthService.ACCESS_TOKEN_STORAGE_KEY);
    this.removeItem(AuthService.REFRESH_TOKEN_STORAGE_KEY);
  }

  protected hasExpiredToken(): boolean {
    const accessToken = this.getAccessToken();

    if (accessToken) {
      let payload = jwtDecode(accessToken) as IJwtToken;
      if (Date.now() >= payload.exp * 1000) {
        const refreshToken = this.getRefreshToken();
        payload = jwtDecode(refreshToken) as IJwtToken;
        return Date.now() >= payload.exp * 1000;
      }
    }
    return true;
  }

  protected getAuthStatusFromToken(): IAuthStatus {
    return this.transformJwtToken(jwtDecode(this.getAccessToken()));
  }
}
