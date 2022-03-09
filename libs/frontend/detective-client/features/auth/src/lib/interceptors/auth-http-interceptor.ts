import { BehaviorSubject, Observable, Subscription, catchError, filter, of, switchMap, take, tap } from 'rxjs';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { AuthService } from '../services/auth.service';
import { IAuthServerResponse } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { environment } from '@detective.solutions/frontend/shared/environments';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
  private static readonly translationScope = 'auth';

  private readonly accessTokenSubject = new BehaviorSubject<any>(null);
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly logger: LogService,
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly translationService: TranslocoService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authService.getAccessToken()) {
      if (this.authService.isRefreshing || this.authService.isLoggingOut) {
        request = this.setAuthorizationHeader(request, this.authService.getRefreshToken());
      } else {
        request = this.setAuthorizationHeader(request, this.authService.getAccessToken());
      }
    }
    return next.handle(request).pipe(
      catchError((error) => {
        if (this.isAuthorizationError(error, request)) {
          this.handleAuthorizationError(request, next);
        }
        return of(error);
      })
    );
  }

  setAuthorizationHeader(request: HttpRequest<any>, authorizationToken: string) {
    return request.clone({ setHeaders: { authorization: `Bearer ${authorizationToken}` } });
  }

  isAuthorizationError(error: HttpErrorResponse, request: HttpRequest<any>): boolean {
    return error instanceof HttpErrorResponse && error.status === 401 && request.url.startsWith(environment.baseUrl);
  }

  handleAuthorizationError(request: HttpRequest<any>, next: HttpHandler) {
    // Explicitly exclude refresh url to prevent infinite loop
    if (!request.url.endsWith('refresh')) {
      // Initiate token refresh if necessary
      if (this.authService.tokenRefreshNeeded()) {
        this.logger.info('Access token expired. Refreshing ...');
        this.refreshTokens(request, next);
      }
    }
    // Handle error produced by refresh route
    else if (request.url.endsWith('refresh')) {
      // Logout & redirect to login if refresh token is expired
      this.logger.info('Refresh token expired. Logging out ...');
      this.logoutAndRedirect();
    }
    // Handle error produced by login route
    else if (request.url.endsWith('login')) {
      this.logger.error('Invalid login credentials');
      this.subscriptions.add(
        this.translationService
          .selectTranslate('toastMessages.loginFailed', {}, AuthHttpInterceptor.translationScope)
          .subscribe((translation) => this.toastService.showToast(translation, '', ToastType.ERROR, { duration: 3500 }))
      );
    }
    // Handle error produced by logout route
    else if (request.url.endsWith('logout')) {
      this.logoutAndRedirect();
    }
    // General handling of 401 errors
    else {
      this.showExpiredLoginToast();
    }
  }

  refreshTokens(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.authService.isRefreshing) {
      this.accessTokenSubject.next(null);
      this.authService.refreshTokens().pipe(
        tap((tokens: IAuthServerResponse) => {
          this.accessTokenSubject.next(tokens.access_token);
          this.logger.debug('Retrying unauthorized request ...');
          next.handle(this.setAuthorizationHeader(request, tokens.access_token));
        })
      );
    } else {
      // If a token refresh is on progress, queue up incoming requests and provide them with updated access tokens
      this.accessTokenSubject.pipe(
        filter((accessToken) => accessToken !== null),
        take(1),
        tap(() => this.logger.debug('Retrying queued request after token refresh ...')),
        tap((accessToken) => next.handle(this.setAuthorizationHeader(request, accessToken)))
      );
    }
  }

  logoutAndRedirect() {
    this.authService.logout(true);
    this.router.navigate(['/login'], {
      queryParams: { redirectUrl: this.router.url },
    });
  }

  // Show info toast as default behavior if login has expired to provide better UX
  showExpiredLoginToast() {
    this.logger.error('Login expired');
    this.subscriptions.add(
      this.translationService
        .selectTranslate('toastMessages.loginExpired', {}, AuthHttpInterceptor.translationScope)
        .subscribe((translation) => {
          const toast = this.toastService.showToast(translation, 'Login', ToastType.INFO);
          toast.onAction().subscribe(() => {
            this.router.navigate(['/login'], {
              queryParams: { redirectUrl: this.router.url },
            });
          });
        })
    );
  }
}
