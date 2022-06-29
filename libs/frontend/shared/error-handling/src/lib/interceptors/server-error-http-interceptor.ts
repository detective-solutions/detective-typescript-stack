import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, take, throwError } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

@Injectable({ providedIn: 'root' })
export class ServerErrorHttpInterceptor implements HttpInterceptor {
  constructor(
    private readonly toastService: ToastService,
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

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
          .selectTranslate('toastMessages.byStatusCode.500', {}, this.translationScope)
          .pipe(take(1))
          .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
        break;
      // Service Unavailable
      case 503:
        this.translationService
          .selectTranslate('toastMessages.byStatusCode.503', {}, this.translationScope)
          .pipe(take(1))
          .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
        break;
      // Gateway Timeout
      case 504:
        this.translationService
          .selectTranslate('toastMessages.byStatusCode.504', {}, this.translationScope)
          .pipe(take(1))
          .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }
}
