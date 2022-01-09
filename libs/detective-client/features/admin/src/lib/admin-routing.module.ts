import { RouterModule, Routes } from '@angular/router';

import { AdminContainerComponent } from './components/admin-container.component';
import { ConnectionsComponent } from './components/connections/connections.component';
import { GroupsComponent } from './components/groups/groups.component';
import { MasksComponent } from './components/masks/masks.component';
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
