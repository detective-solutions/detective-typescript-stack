import { AuthHttpInterceptor, AuthModule, AuthService } from '@detective.solutions/detective-client/features/auth';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core.module';
import { NgModule } from '@angular/core';
import { TranslocoRootModule } from './transloco-root.module';
import { authFactory } from './auth/auth.factory';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CoreModule, AppRoutingModule, BrowserAnimationsModule, AuthModule, TranslocoRootModule],
  providers: [
    { provide: AuthService, useFactory: authFactory, deps: [HttpClient] },
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
