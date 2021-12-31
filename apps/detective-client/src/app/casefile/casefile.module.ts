import { CasefileContainerComponent } from './casefile-container/casefile-container.component';
import { CasefileRoutingModule } from './casefile-routing.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [CasefileContainerComponent],
  imports: [CommonModule, CasefileRoutingModule],
})
export class CasefileModule {}
