import { RouterModule, Routes } from '@angular/router';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from './components';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

const routes: Routes = [{ path: '**', component: PageNotFoundComponent }];

@NgModule({
  declarations: [PageNotFoundComponent],
  imports: [CommonModule, TranslocoModule, RouterModule.forChild(routes)],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: {
        scope: 'pageNotFound',
        loader: langScopeLoader((lang: string, root: string) => import(`./${root}/${lang}.json`)),
      },
    },
  ],
  exports: [PageNotFoundComponent],
})
export class SharedPageNotFoundModule {}
