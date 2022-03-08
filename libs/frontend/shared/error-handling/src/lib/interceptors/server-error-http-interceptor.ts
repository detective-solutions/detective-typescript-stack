import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({ providedIn: 'root' })
export class ServerErrorHttpInterceptor implements HttpInterceptor {
  private static readonly translationScope = 'errorHandling';

  constructor(private readonly translationService: TranslocoService, private readonly toastService: ToastService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((returnedError) => {
        if (returnedError.error instanceof ErrorEvent) {
          console.error(`Error: ${returnedError.error.message}`);
        } else if (returnedError instanceof HttpErrorResponse) {
          this.handleServerSideError(returnedError);
        }
        return throwError(() => returnedError);
      })
    );
  }

  private handleServerSideError(error: HttpErrorResponse) {
    switch (error.status) {
      // Internal Server Error
      case 500:
        this.translationService
          .selectTranslate('toastMessages.byStatusCode.500', {}, ServerErrorHttpInterceptor.translationScope)
          .subscribe((translation) =>
            this.toastService.showToast(translation, '', ToastType.ERROR, { duration: 3500 })
          );
        break;
      // Service Unavailable
      case 503:
        this.translationService
          .selectTranslate('toastMessages.byStatusCode.503', {}, ServerErrorHttpInterceptor.translationScope)
          .subscribe((translation) =>
            this.toastService.showToast(translation, '', ToastType.ERROR, { duration: 3500 })
          );
    }
  }
}
