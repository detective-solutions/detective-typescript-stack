import { RouterModule, Routes } from '@angular/router';

import { AdminContainerComponent } from './admin-container/admin-container.component';
import { ConnectionsComponent } from './connections/connections.component';
import { GroupsComponent } from './groups/groups.component';
import { MasksComponent } from './masks/masks.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: AdminContainerComponent,
    children: [
      { path: '', redirectTo: '/admin/connections', pathMatch: 'full' },
      { path: 'connections', component: ConnectionsComponent },
      { path: 'groups', component: GroupsComponent },
      { path: 'masks', component: MasksComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
