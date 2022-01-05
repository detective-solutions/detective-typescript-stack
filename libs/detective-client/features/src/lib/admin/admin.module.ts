import { AdminContainerComponent } from './admin-container/admin-container.component';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';
import { ConnectionsComponent } from './connections/connections.component';
import { GroupsComponent } from './groups/groups.component';
import { MasksComponent } from './masks/masks.component';
import { NgModule } from '@angular/core';
import { UiModule } from '@detective.solutions/detective-client/ui';

@NgModule({
  declarations: [AdminContainerComponent, ConnectionsComponent, GroupsComponent, MasksComponent],
  imports: [CommonModule, AdminRoutingModule, UiModule],
})
export class AdminModule {}
