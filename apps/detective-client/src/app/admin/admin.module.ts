import { AdminContainerComponent } from './admin-container/admin-container.component';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [AdminContainerComponent],
  imports: [CommonModule, AdminRoutingModule],
})
export class AdminModule {}
