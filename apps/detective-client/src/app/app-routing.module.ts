import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from '@detective.solutions/shared/components';
import { RegisterComponent } from './auth/register/register.component';

const routes: Routes = [
  { path: '', redirectTo: '/portal/my-casefiles', pathMatch: 'full' },
  { path: 'portal', loadChildren: () => import('./portal/portal.module').then((m) => m.PortalModule) },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
