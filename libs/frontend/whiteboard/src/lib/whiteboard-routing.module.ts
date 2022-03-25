import { RouterModule, Routes } from '@angular/router';

import { HostComponent } from './components/host/host.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: HostComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WhiteboardRoutingModule {}
