import { AuthService, CustomAuthService } from './services';

import { Apollo } from 'apollo-angular';
import { AuthHttpInterceptor } from './interceptors/auth-http-interceptor';
import { CommonModule } from '@angular/common';
import { GetUserGQL } from './graphql/get-user-gql';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './components/register/register.component';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  declarations: [RegisterComponent],
  imports: [CommonModule, TranslocoModule, RouterModule],
  exports: [RegisterComponent],
  providers: [
    { provide: AuthService, useClass: CustomAuthService },
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
    Apollo,
    GetUserGQL,
  ],
})
export class AuthModule {}
