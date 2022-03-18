import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({ providedIn: 'root' })
export class ServerErrorHttpInterceptor implements HttpInterceptor {
  private static readonly translationScope = 'errorHandling';

  constructor(private readonly toastService: ToastService, private readonly translationService: TranslocoService) {}

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
          .subscribe((translation) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
        break;
      // Service Unavailable
      case 503:
        this.translationService
          .selectTranslate('toastMessages.byStatusCode.503', {}, ServerErrorHttpInterceptor.translationScope)
          .subscribe((translation) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
        break;
      // Gateway Timeout
      case 504:
        this.translationService
          .selectTranslate('toastMessages.byStatusCode.504', {}, ServerErrorHttpInterceptor.translationScope)
          .subscribe((translation) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }
}
