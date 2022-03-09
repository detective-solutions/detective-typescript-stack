import { BehaviorSubject, EMPTY, Observable, catchError, filter, map, mergeMap, pipe, tap } from 'rxjs';
import { IAuthServerResponse, IJwtTokenPayload } from '@detective.solutions/shared/data-access';
import { IAuthStatus, defaultAuthStatus } from '../interfaces/auth-status.interface';

import { CacheService } from './cache.service';
import { IAuthService } from '../interfaces/auth-service.interface';
import { Injectable } from '@angular/core';
import { User } from '@detective.solutions/frontend/shared/data-access';
import jwtDecode from 'jwt-decode';
import { transformError } from '@detective.solutions/frontend/shared/error-handling';

@Injectable()
export abstract class AuthService extends CacheService implements IAuthService {
  protected static ACCESS_TOKEN_STORAGE_KEY = 'access_token';
  protected static REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

  // Flags to determine when to use refresh token as bearer token in AuthHttpInterceptor
  isRefreshing = false;
  isLoggingOut = false;

  private getAndUpdateUserIfAuthenticated = pipe(
    filter((authStatus: IAuthStatus) => authStatus.isAuthenticated),
    mergeMap((authStatus) => this.getCurrentUser(authStatus.userId)),
    map((user: User) => this.currentUser$.next(user))
  );

  readonly authStatus$ = new BehaviorSubject<IAuthStatus>(defaultAuthStatus);
  readonly currentUser$ = new BehaviorSubject<User>(new User());

  protected readonly resumeCurrentUser$ = this.authStatus$.pipe(
    this.getAndUpdateUserIfAuthenticated,
    catchError(transformError)
  );

  protected abstract loginProvider(email: string, password: string): Observable<IAuthServerResponse>;
  protected abstract logoutProvider(): Observable<void>;
  protected abstract refreshProvider(): Observable<IAuthServerResponse>;
  protected abstract transformJwtToken(token: IJwtTokenPayload): IAuthStatus;
  protected abstract getCurrentUser(userId: string): Observable<User>;

  constructor() {
    super();
    // Resume current user if a valid access token is available
    if (!this.hasExpiredToken(this.getAccessToken())) {
      this.authStatus$.next(this.getAuthStatusFromToken());
      // Resume pipe must run on the next cycle to make sure all services are constructed correctly
      setTimeout(() => this.resumeCurrentUser$.subscribe());
    }
  }

  login(email: string, password: string): Observable<void> {
    this.clearAuthTokens();
    return this.loginProvider(email, password).pipe(
      map((response: IAuthServerResponse) => {
        this.setAuthTokens(response.access_token, response.refresh_token);
        return this.getAuthStatusFromToken();
      }),
      tap((status) => this.authStatus$.next(status)),
      this.getAndUpdateUserIfAuthenticated,
      catchError(transformError)
    );
  }

  logout(clearToken?: boolean): Observable<void> {
    this.isLoggingOut = true;
    return this.logoutProvider().pipe(
      tap(() => {
        if (clearToken) {
          this.clearAuthTokens();
          this.authStatus$.next(defaultAuthStatus);
        }
        this.isLoggingOut = false;
      })
    );
  }

  refreshTokens(): Observable<IAuthServerResponse> {
    this.isRefreshing = true;
    return this.refreshProvider().pipe(
      tap((response: IAuthServerResponse) => {
        this.isRefreshing = false;
        this.setAuthTokens(response.access_token, response.refresh_token);
        this.authStatus$.next(this.getAuthStatusFromToken());
      }),
      catchError((err) => {
        this.isRefreshing = false;
        this.logout(true);
        console.log('ERROR');
        transformError(err);
        return EMPTY;
      })
    );
  }

  getAccessToken(): string {
    return this.getItem(AuthService.ACCESS_TOKEN_STORAGE_KEY) ?? '';
  }

  getRefreshToken(): string {
    return this.getItem(AuthService.REFRESH_TOKEN_STORAGE_KEY) ?? '';
  }

  tokenRefreshNeeded(): boolean {
    const hasExpiredAccessToken = this.hasExpiredToken(this.getAccessToken());
    const hasExpiredRefreshToken = this.hasExpiredToken(this.getRefreshToken());
    return hasExpiredAccessToken && !hasExpiredRefreshToken ? true : false;
  }

  hasExpiredToken(tokenToTest: string): boolean {
    if (!tokenToTest) {
      return true;
    }
    const tokenPayload = jwtDecode(tokenToTest) as IJwtTokenPayload;
    if (tokenPayload) {
      return Date.now() >= tokenPayload.exp * 1000 ? true : false;
    }
    return true;
  }

  protected setAuthTokens(accessToken: string, refreshToken: string) {
    this.setItem(AuthService.ACCESS_TOKEN_STORAGE_KEY, accessToken);
    this.setItem(AuthService.REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  protected clearAuthTokens() {
    this.removeItem(AuthService.ACCESS_TOKEN_STORAGE_KEY);
    this.removeItem(AuthService.REFRESH_TOKEN_STORAGE_KEY);
  }

  private getAuthStatusFromToken(): IAuthStatus {
    return this.transformJwtToken(jwtDecode(this.getAccessToken()));
  }
}
