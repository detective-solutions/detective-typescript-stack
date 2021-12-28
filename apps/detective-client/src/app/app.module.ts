import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LoginComponent } from './app/auth/login/login.component';
import { LogoutComponent } from './app/auth/logout/logout.component';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './app/auth/register/register.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, RegisterComponent, LogoutComponent],
  imports: [BrowserModule, CoreModule, AppRoutingModule, BrowserAnimationsModule, FlexLayoutModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
