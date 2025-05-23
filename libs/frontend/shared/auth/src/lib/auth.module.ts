import { AuthService, CustomAuthService } from './services';

import { AuthHttpInterceptor } from './interceptors/auth-http-interceptor';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  imports: [CommonModule, TranslocoModule, RouterModule],
  providers: [
    { provide: AuthService, useClass: CustomAuthService },
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
})
export class AuthModule {}
