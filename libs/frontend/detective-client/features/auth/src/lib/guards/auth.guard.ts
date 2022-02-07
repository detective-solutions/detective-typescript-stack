import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, map, take } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(protected authService: AuthService, protected router: Router) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canLoad(route: Route): boolean | Observable<boolean> | Promise<boolean> {
    return this.checkLogin();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.checkLogin(route);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.checkLogin(childRoute);
  }

  protected checkLogin(route?: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.authStatus$.pipe(
      map((authStatus) => {
        const allowLogin = authStatus.isAuthenticated;
        if (!allowLogin) {
          this.router.navigate(['login'], {
            queryParams: {
              redirectUrl: this.getResolvedUrl(route),
            },
          });
        }
        return allowLogin;
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
