import { RouterModule, Routes } from '@angular/router';

import { AdminContainerComponent } from './admin-container/admin-container.component';
import { NgModule } from '@angular/core';

const routes: Routes = [{ path: '', component: AdminContainerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
