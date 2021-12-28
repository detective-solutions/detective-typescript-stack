import { RouterModule, Routes } from '@angular/router';

import { AllCasefilesComponent } from './all-casefiles/all-casefiles.component';
import { DataSourcesComponent } from './data-sources/data-sources.component';
import { MyCasefilesComponent } from './my-casefiles/my-casefiles.component';
import { NgModule } from '@angular/core';
import { PortalContainerComponent } from './portal-container/portal-container.component';

const routes: Routes = [
  {
    path: '',
    component: PortalContainerComponent,
    children: [
      { path: '', redirectTo: '/portal/my-casefiles', pathMatch: 'full' },
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
export class PortalRoutingModule {}
