import { AppComponent } from './app.component';
import { AppMaterialModule } from './app-material.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LoginComponent } from './auth/login/login.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './auth/register/register.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, RegisterComponent, LogoutComponent],
  imports: [BrowserModule, CoreModule, AppRoutingModule, BrowserAnimationsModule, FlexLayoutModule, AppMaterialModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
