import { LoginComponent, RegisterComponent } from '@detective.solutions/detective-client/features/auth';
import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from '@detective.solutions/shared/ui';

const routes: Routes = [
  { path: '', redirectTo: '/home/my-casefiles', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('@detective.solutions/detective-client/features/home').then((m) => m.HomeModule),
  },
  { path: 'casefile/:id', loadChildren: () => import('./casefile/casefile.module').then((m) => m.CasefileModule) },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    loadChildren: () => import('@detective.solutions/detective-client/features/admin').then((m) => m.AdminModule),
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
