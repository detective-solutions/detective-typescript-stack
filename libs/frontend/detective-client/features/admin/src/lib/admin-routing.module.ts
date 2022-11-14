/* eslint-disable no-alert, no-console */
import { RouterModule, Routes } from '@angular/router';

import { AdminContainerComponent } from './components/admin-container.component';
import { ConnectionsComponent } from './components/connections/connections.component';
import { GroupsComponent } from './components/groups/groups.component';
import { MaskingsComponent } from './components/maskings/masking.component';
import { NgModule } from '@angular/core';
import { SubscriptionsComponent } from './components/subscriptions/subscriptions.component';
import { UsersComponent } from './components/users/users.component';

const routes: Routes = [
  {
    path: '',
    component: AdminContainerComponent,
    children: [
      { path: '', redirectTo: '/admin/connections', pathMatch: 'full' },
      { path: 'connections', component: ConnectionsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'groups', component: GroupsComponent },
      { path: 'maskings', component: MaskingsComponent },
      { path: 'subscriptions', component: SubscriptionsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
