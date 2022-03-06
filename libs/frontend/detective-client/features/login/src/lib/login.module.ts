import { RouterModule, Routes } from '@angular/router';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { LoginMaterialModule } from './login-material.module';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

const routes: Routes = [{ path: '**', component: LoginComponent }];

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, TranslocoModule, RouterModule.forChild(routes), ReactiveFormsModule, LoginMaterialModule],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: {
        scope: 'login',
        loader: langScopeLoader((lang: string, root: string) => import(`./${root}/${lang}.json`)),
      },
    },
  ],
})
export class LoginModule {}
