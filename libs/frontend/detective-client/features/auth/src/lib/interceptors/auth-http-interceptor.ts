import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const jwt = this.authService.getToken();
    const authRequest = req.clone({ setHeaders: { authorization: `Bearer ${jwt}` } });
    return next.handle(authRequest).pipe(
      catchError((err) => {
        if (err.status === 401) {
          this.router.navigate(['/login'], {
            queryParams: { redirectUrl: this.router.routerState.snapshot.url },
          });
        }

        return throwError(() => new Error(err));
      })
    );
  }
}
