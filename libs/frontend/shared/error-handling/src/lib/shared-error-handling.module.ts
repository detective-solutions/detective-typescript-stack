import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ServerErrorHttpInterceptor } from './interceptors';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';

@NgModule({
  imports: [CommonModule],
  providers: [
    // Make sure to provide the i18n files at "assets/i18n/errorHandling" via the "project.json" config
    {
      provide: TRANSLOCO_SCOPE,
      useValue: {
        scope: 'errorHandling',
      },
    },
    { provide: HTTP_INTERCEPTORS, useClass: ServerErrorHttpInterceptor, multi: true },
  ],
})
export class SharedErrorHandlingModule {}
