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

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
  private static readonly translationScope = 'auth';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly accessTokenSubject = new BehaviorSubject<any>(null);
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly logger: LogService,
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly translationService: TranslocoService
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authService.getAccessToken()) {
      if (this.authService.isRefreshing) {
        request = this.setAuthorizationHeader(request, this.authService.getRefreshToken());
      } else {
        request = this.setAuthorizationHeader(request, this.authService.getAccessToken());
      }
    }
    return next.handle(request).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && request.url.startsWith(environment.baseUrl) && err.status === 401) {
          // Initiate token refresh if necessary
          // Explicitly exclude refresh url to prevent infinite loop
          if (!request.url.endsWith('refresh') && this.authService.canRefresh()) {
            this.logger.info('Access token expired. Refreshing ...');
            return this.refreshTokens(request, next);
          }
          // Handle error produced by login route
          if (request.url.endsWith('login')) {
            this.logger.error('Invalid login credentials');
            this.subscriptions.add(
              this.translationService
                .selectTranslate('toastMessages.loginFailed', {}, AuthHttpInterceptor.translationScope)
                .subscribe((translation) =>
                  this.toastService.showToast(translation, '', ToastType.ERROR, { duration: 3500 })
                )
            );
          } else {
            // General handling of 401 errors
            this.logoutAndRedirect(request);
          }
        }
        return of(err);
      })
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logoutAndRedirect(request: HttpRequest<any>) {
    this.authService.logout();

    // Redirect to login on failed token refresh
    if (request.url.endsWith('refresh')) {
      this.router.navigate(['/login'], {
        queryParams: { redirectUrl: this.router.url },
      });
      // Show info toast if login has expired while using the application to provide better UX
    } else if (!request.url.endsWith('login')) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refreshTokens(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.authService.isRefreshing) {
      this.accessTokenSubject.next(null);
      return this.authService.refreshTokens().pipe(
        switchMap((tokens: IAuthServerResponse) => {
          this.accessTokenSubject.next(tokens.access_token);
          this.logger.debug('Retrying unauthorized request ...');
          return next.handle(this.setAuthorizationHeader(request, tokens.access_token));
        })
      );
    } else {
      // If a token refresh is on progress, queue up incoming requests and provide them with updated access tokens
      return this.accessTokenSubject.pipe(
        filter((accessToken) => accessToken !== null),
        take(1),
        tap(() => this.logger.debug('Retrying queued request after token refresh ...')),
        switchMap((accessToken) => next.handle(this.setAuthorizationHeader(request, accessToken)))
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAuthorizationHeader(request: HttpRequest<any>, authorizationToken: string) {
    return request.clone({ setHeaders: { authorization: `Bearer ${authorizationToken}` } });
  }
}
