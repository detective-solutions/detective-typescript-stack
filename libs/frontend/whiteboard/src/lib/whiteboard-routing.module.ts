import { RouterModule, Routes } from '@angular/router';

import { HostComponent } from './components';
import { NgModule } from '@angular/core';
import { WhiteboardContextResolver } from './resolvers';
import { WhiteboardLeaveGuard } from './guards';

const routes: Routes = [
  {
    path: '',
    component: HostComponent,
    // Object key is a no-op, because a key is needed
    resolve: { state: WhiteboardContextResolver },
    canDeactivate: [WhiteboardLeaveGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WhiteboardRoutingModule {}
