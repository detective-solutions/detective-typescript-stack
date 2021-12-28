import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from '@detective.solutions/shared/components';

const routes: Routes = [{ path: '**', component: PageNotFoundComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
