import {
  AllCasefilesComponent,
  DataSourcesComponent,
  HomeContainerComponent,
  MyCasefilesComponent,
} from './components';
import { CasefileService, DataSourceService } from './services';
import { GetAllCasefilesGQL, GetAllDataSourcesGQL, GetCasefilesByAuthorGQL } from './graphql';
import { NavigationModule, TableModule, TilesModule } from '@detective.solutions/frontend/detective-client/ui';

import { CommonModule } from '@angular/common';
import { HomeMaterialModule } from './home.material.module';
import { HomeRoutingModule } from './home-routing.module';
import { NgModule } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

@NgModule({
  declarations: [HomeContainerComponent, MyCasefilesComponent, AllCasefilesComponent, DataSourcesComponent],
  imports: [CommonModule, HomeRoutingModule, NavigationModule, TilesModule, TableModule, HomeMaterialModule],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: {
        scope: 'home',
        loader: langScopeLoader((lang: string, root: string) => import(`./${root}/${lang}.json`)),
      },
    },
    CasefileService,
    DataSourceService,
    GetAllCasefilesGQL,
    GetCasefilesByAuthorGQL,
    GetAllDataSourcesGQL,
  ],
})
export class HomeModule {}
