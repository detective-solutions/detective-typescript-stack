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
        //   const roleMatch = this.checkRoleMatch(authStatus.userRole, route)
        //   const allowLogin = authStatus.isAuthenticated && roleMatch
        const allowLogin = authStatus.isAuthenticated;
        if (!allowLogin) {
          // this.showAlert(authStatus.isAuthenticated, roleMatch)
          this.router.navigate(['login'], {
            queryParams: {
              redirectUrl: this.getResolvedUrl(route),
            },
          });
        }
        return allowLogin;
      }),
      take(1) // the observable must complete for the guard to work
    );
  }

  // private checkRoleMatch(role: Role, route?: ActivatedRouteSnapshot) {
  //   if (!route?.data?.expectedRole) {
  //     return true
  //   }
  //   return role === route.data.expectedRole
  // }

  // private showAlert(isAuth: boolean, roleMatch: boolean) {
  //   if (!isAuth) {
  //     this.uiService.showToast('You must login to continue')
  //   }

  //   if (!roleMatch) {
  //     this.uiService.showToast('You do not have the permissions to view this resource')
  //   }
  // }

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
