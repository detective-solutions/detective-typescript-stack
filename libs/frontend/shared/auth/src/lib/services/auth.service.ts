import { BehaviorSubject, EMPTY, Observable, Subject, catchError, map, tap } from 'rxjs';
import { IAuthServerResponse, IJwtTokenPayload } from '@detective.solutions/shared/data-access';
import { IAuthStatus, defaultAuthStatus } from '../interfaces/auth-status.interface';

import { CacheService } from './cache.service';
import { IAuthService } from '../interfaces/auth-service.interface';
import { Injectable } from '@angular/core';
import jwtDecode from 'jwt-decode';
import { transformError } from '@detective.solutions/frontend/shared/error-handling';

@Injectable()
export abstract class AuthService extends CacheService implements IAuthService {
  protected static ACCESS_TOKEN_STORAGE_KEY = 'detective_access_token';
  protected static REFRESH_TOKEN_STORAGE_KEY = 'detective_refresh_token';

  // Flags to determine when to use refresh token as bearer token in AuthHttpInterceptor
  isRefreshing = false;
  isLoggingOut = false;

  readonly authStatus$ = new BehaviorSubject<IAuthStatus>(defaultAuthStatus);
  readonly loggedOut$ = new Subject<boolean>();

  protected abstract loginProvider(email: string, password: string): Observable<IAuthServerResponse>;
  protected abstract logoutProvider(): Observable<void>;
  protected abstract refreshProvider(): Observable<IAuthServerResponse>;
  protected abstract transformJwtToken(token: IJwtTokenPayload): IAuthStatus;

  constructor() {
    super();
    // Resume auth status if a valid access token is available
    if (!this.hasExpiredToken(this.getAccessToken())) {
      this.authStatus$.next(this.getAuthStatusFromToken());
    }
  }

  login(email: string, password: string): Observable<IAuthStatus> {
    this.clearAuthTokens();
    return this.loginProvider(email, password).pipe(
      map((response: IAuthServerResponse) => {
        this.setAuthTokens(response.access_token, response.refresh_token);
        return this.getAuthStatusFromToken();
      }),
      tap((status) => this.authStatus$.next(status)),
      catchError(transformError)
    );
  }

  logout(clearToken?: boolean): Observable<void> {
    this.isLoggingOut = true;
    this.loggedOut$.next(true); // Inform possible subscribers about logout
    return this.logoutProvider().pipe(
      tap(() => {
        if (clearToken) {
          this.clearAuthTokens();
          this.authStatus$.next(defaultAuthStatus);
        }
        this.isLoggingOut = false;
      }),
      catchError(() => {
        this.isLoggingOut = false;
        return EMPTY;
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
        return transformError(err);
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

  clearAuthTokens() {
    this.removeItem(AuthService.ACCESS_TOKEN_STORAGE_KEY);
    this.removeItem(AuthService.REFRESH_TOKEN_STORAGE_KEY);
  }

  protected setAuthTokens(accessToken: string, refreshToken: string) {
    this.setItem(AuthService.ACCESS_TOKEN_STORAGE_KEY, accessToken);
    this.setItem(AuthService.REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  private getAuthStatusFromToken(): IAuthStatus {
    return this.transformJwtToken(jwtDecode(this.getAccessToken()));
  }
}
