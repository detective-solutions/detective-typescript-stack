import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

@Injectable({ providedIn: 'root' })
export class ServerErrorHttpInterceptor implements HttpInterceptor {
  constructor(
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translocoProviderScope: ProviderScope,
    private readonly toastService: ToastService
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
        return of(returnedError);
      })
    );
  }

  private handleServerSideError(error: HttpErrorResponse) {
    switch (error.status) {
      case 500:
        this.translationService
          .selectTranslate('toastMessages.byStatusCode.500', {}, this.translocoProviderScope.scope)
          .subscribe((translation) =>
            this.toastService.showToast(translation, '', ToastType.ERROR, { duration: 3500 })
          );
        break;
      case 503:
        this.translationService
          .selectTranslate('toastMessages.byStatusCode.503', {}, this.translocoProviderScope.scope)
          .subscribe((translation) =>
            this.toastService.showToast(translation, '', ToastType.ERROR, { duration: 3500 })
          );
    }
  }
}
