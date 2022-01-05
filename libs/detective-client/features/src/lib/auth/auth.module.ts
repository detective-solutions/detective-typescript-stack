import { AuthMaterialModule } from './auth-material.module';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [LoginComponent, LogoutComponent, RegisterComponent],
  imports: [CommonModule, AuthMaterialModule],
})
export class AuthModule {}
