import {
  AllCasefilesComponent,
  CasefileCreateDialogComponent,
  DataSourcesComponent,
  HomeContainerComponent,
  MyCasefilesComponent,
} from './components';
import { GetAllDataSourcesGQL, SearchCasefilesByTenantGQL } from './graphql';
import { NavigationModule, TableModule, TilesModule } from '@detective.solutions/frontend/detective-client/ui';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

import { CommonModule } from '@angular/common';
import { DataSourceService } from './services';
import { HomeMaterialModule } from './home.material.module';
import { HomeRoutingModule } from './home-routing.module';
import { NgModule } from '@angular/core';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

@NgModule({
  declarations: [
    HomeContainerComponent,
    MyCasefilesComponent,
    AllCasefilesComponent,
    CasefileCreateDialogComponent,
    DataSourcesComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    TranslocoModule,
    NavigationModule,
    TilesModule,
    TableModule,
    HomeMaterialModule,
  ],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: {
        scope: 'home',
        loader: langScopeLoader((lang: string, root: string) => import(`./${root}/${lang}.json`)),
      },
    },
    DataSourceService,
    GetAllDataSourcesGQL,
    SearchCasefilesByTenantGQL,
  ],
})
export class HomeModule {}
