import { RouterModule, Routes } from '@angular/router';

import { CasefileContainerComponent } from './casefile-container/casefile-container.component';
import { NgModule } from '@angular/core';

const routes: Routes = [{ path: '', component: CasefileContainerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CasefileRoutingModule {}
