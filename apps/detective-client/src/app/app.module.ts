import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core.module';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CoreModule, AppRoutingModule, BrowserAnimationsModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
