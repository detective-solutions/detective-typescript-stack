import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, map, of, switchMap, take } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    protected readonly authService: AuthService,
    protected readonly router: Router,
    private readonly logger: LogService
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canLoad(route: Route): boolean | Observable<boolean> | Promise<boolean> {
    return this.checkLogin();
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.checkLogin(route);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.checkLogin(childRoute);
  }

  protected checkLogin(route?: ActivatedRouteSnapshot): Observable<boolean> {
    this.logger.debug(`Access token expired: ${this.authService.hasExpiredToken(this.authService.getAccessToken())}`);
    this.logger.debug(`Refresh token expired: ${this.authService.hasExpiredToken(this.authService.getRefreshToken())}`);

    return this.authService.authStatus$.pipe(
      switchMap((authStatus) => {
        const loginAllowed = authStatus.isAuthenticated;
        if (!loginAllowed && this.authService.tokenRefreshNeeded()) {
          return this.authService.refreshTokens().pipe(
            switchMap(() => this.authService.authStatus$),
            map((updatedAuthStatus) => updatedAuthStatus.isAuthenticated)
          );
        } else if (!loginAllowed) {
          this.authService.logout(true);
          this.router.navigate(['login'], {
            queryParams: {
              redirectUrl: this.getResolvedUrl(route),
            },
          });
        }
        return of(loginAllowed);
      }),
      take(1) // The observable must complete for the guard to work
    );
  }

  getResolvedUrl(route?: ActivatedRouteSnapshot): string {
    if (!route) {
      return '';
    }

    return route.pathFromRoot
      .map((r) => r.url.map((segment) => segment.toString()).join('/'))
      .join('/')
      .replace('//', '/');
  }
}
