import { AuthGuard, LoginComponent, RegisterComponent } from '@detective.solutions/detective-client/features/auth';
import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';

const routes: Routes = [
  { path: '', redirectTo: '/home/my-casefiles', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'login/:redirectUrl', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'home',
    loadChildren: () => import('@detective.solutions/detective-client/features/home').then((m) => m.HomeModule),
    canActivate: [AuthGuard],
  },
  { path: 'casefile/:id', loadChildren: () => import('./casefile/casefile.module').then((m) => m.CasefileModule) },
  {
    path: 'admin',
    loadChildren: () => import('@detective.solutions/detective-client/features/admin').then((m) => m.AdminModule),
    canLoad: [AuthGuard],
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
