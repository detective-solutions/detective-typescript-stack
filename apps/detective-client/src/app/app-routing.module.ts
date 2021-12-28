import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from '@detective.solutions/shared/components';

const routes: Routes = [
  { path: '', redirectTo: '/portal/my-casefiles', pathMatch: 'full' },
  { path: 'portal', loadChildren: () => import('./portal/portal.module').then((m) => m.PortalModule) },
  { path: 'login', component: LoginComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
