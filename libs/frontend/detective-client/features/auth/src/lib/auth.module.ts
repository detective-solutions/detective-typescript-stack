import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

import { AuthMaterialModule } from './auth-material.module';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { InMemoryAuthService } from './services/auth.inmemory.service';
import { LoginComponent } from './components/login/login.component';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './components/register/register.component';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [CommonModule, TranslocoModule, AuthMaterialModule],
  exports: [LoginComponent, RegisterComponent],
  providers: [
    { provide: AuthService, useClass: InMemoryAuthService },
    {
      provide: TRANSLOCO_SCOPE,
      useValue: {
        scope: 'auth',
        loader: langScopeLoader((lang: string, root: string) => import(`./${root}/${lang}.json`)),
      },
    },
  ],
})
export class AuthModule {}
