import { AuthModule, AuthService, InMemoryAuthService } from '@detective.solutions/detective-client/features/auth';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core.module';
import { NgModule } from '@angular/core';
import { TranslocoRootModule } from './transloco-root.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CoreModule, AppRoutingModule, BrowserAnimationsModule, TranslocoRootModule, AuthModule],
  providers: [{ provide: AuthService, useClass: InMemoryAuthService }],
  bootstrap: [AppComponent],
})
export class AppModule {}
