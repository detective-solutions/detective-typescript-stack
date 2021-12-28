import { AllCasefilesComponent } from './all-casefiles/all-casefiles.component';
import { CommonModule } from '@angular/common';
import { DataSourcesComponent } from './data-sources/data-sources.component';
import { MyCasefilesComponent } from './my-casefiles/my-casefiles.component';
import { NgModule } from '@angular/core';
import { PortalContainerComponent } from './portal-container/portal-container.component';
import { PortalMaterialModule } from './portal-material.module';
import { PortalRoutingModule } from './portal-routing.module';

@NgModule({
  declarations: [PortalContainerComponent, MyCasefilesComponent, AllCasefilesComponent, DataSourcesComponent],
  imports: [CommonModule, PortalRoutingModule, PortalMaterialModule],
})
export class PortalModule {}
