import { AllCasefilesComponent } from './all-casefiles/all-casefiles.component';
import { CommonModule } from '@angular/common';
import { DataSourcesComponent } from './data-sources/data-sources.component';
import { HomeContainerComponent } from './home-container/home-container.component';
import { HomeMaterialModule } from './home-material.module';
import { HomeRoutingModule } from './home-routing.module';
import { MyCasefilesComponent } from './my-casefiles/my-casefiles.component';
import { NavigationModule } from '@detective.solutions/detective-client/ui';
import { NgModule } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

@NgModule({
  declarations: [HomeContainerComponent, MyCasefilesComponent, AllCasefilesComponent, DataSourcesComponent],
  imports: [CommonModule, HomeRoutingModule, HomeMaterialModule, NavigationModule],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: {
        scope: 'home',
        loader: langScopeLoader((lang: string, root: string) => import(`./${root}/${lang}.json`)),
      },
    },
  ],
})
export class HomeModule {}
