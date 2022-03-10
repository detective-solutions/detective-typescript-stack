import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@detective.solutions/frontend/shared/auth';
import { NgModule } from '@angular/core';

const routes: Routes = [
  { path: '', redirectTo: '/home/my-casefiles', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () =>
      import('@detective.solutions/frontend/detective-client/features/login').then((m) => m.LoginModule),
  },
  {
    path: 'login/:redirectUrl',
    loadChildren: () =>
      import('@detective.solutions/frontend/detective-client/features/login').then((m) => m.LoginModule),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('@detective.solutions/frontend/detective-client/features/home').then((m) => m.HomeModule),
    canActivate: [AuthGuard],
  },
  { path: 'casefile/:id', loadChildren: () => import('./casefile/casefile.module').then((m) => m.CasefileModule) },
  {
    path: 'admin',
    loadChildren: () =>
      import('@detective.solutions/frontend/detective-client/features/admin').then((m) => m.AdminModule),
    canLoad: [AuthGuard],
  },
  {
    path: '**',
    loadChildren: () =>
      import('@detective.solutions/frontend/shared/page-not-found').then((m) => m.SharedPageNotFoundModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
