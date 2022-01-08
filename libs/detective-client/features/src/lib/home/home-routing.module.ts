import { RouterModule, Routes } from '@angular/router';

import { AllCasefilesComponent } from './components/all-casefiles/all-casefiles.component';
import { DataSourcesComponent } from './components/data-sources/data-sources.component';
import { HomeContainerComponent } from './components/home-container.component';
import { MyCasefilesComponent } from './components/my-casefiles/my-casefiles.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: HomeContainerComponent,
    children: [
      { path: '', redirectTo: '/home/my-casefiles', pathMatch: 'full' },
      { path: 'my-casefiles', component: MyCasefilesComponent },
      { path: 'all-casefiles', component: AllCasefilesComponent },
      { path: 'data-sources', component: DataSourcesComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
