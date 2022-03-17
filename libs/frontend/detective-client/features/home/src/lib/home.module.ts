import { NavigationModule, TableModule, TilesModule } from '@detective.solutions/frontend/detective-client/ui';

import { AllCasefilesComponent } from './components/all-casefiles/all-casefiles.component';
import { CasefileService } from './services/casefile.service';
import { CommonModule } from '@angular/common';
import { DataSourceService } from './services/data-source.service';
import { DataSourcesComponent } from './components/data-sources/data-sources.component';
import { GetAllCasefilesGQL } from './graphql/get-all-casefiles-gql';
import { GetCasefilesByAuthorGQL } from './graphql/get-casefiles-by-author.gql';
import { HomeContainerComponent } from './components/home-container.component';
import { HomeRoutingModule } from './home-routing.module';
import { MyCasefilesComponent } from './components/my-casefiles/my-casefiles.component';
import { NgModule } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

@NgModule({
  declarations: [HomeContainerComponent, MyCasefilesComponent, AllCasefilesComponent, DataSourcesComponent],
  imports: [CommonModule, HomeRoutingModule, NavigationModule, TilesModule, TableModule],
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
  ],
})
export class HomeModule {}
