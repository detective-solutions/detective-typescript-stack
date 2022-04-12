import { D3Service, DragService, WhiteboardService } from './services';
import { DynamicWhiteboardComponentsDirective, IFrameTrackerDirective } from './directives';
import {
  ElementHeaderComponent,
  HostComponent,
  SelectionHaloComponent,
  SidebarComponent,
  TestLinkComponent,
  WhiteboardTableComponent,
} from './components';

import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { NgModule } from '@angular/core';
import { WhiteboardMaterialModule } from './whiteboard.material.module';
import { WhiteboardRoutingModule } from './whiteboard-routing.module';

@NgModule({
  imports: [CommonModule, AgGridModule, WhiteboardRoutingModule, WhiteboardMaterialModule],
  declarations: [
    HostComponent,
    SidebarComponent,
    ElementHeaderComponent,
    SelectionHaloComponent,
    TestLinkComponent,
    WhiteboardTableComponent,
    IFrameTrackerDirective,
    DynamicWhiteboardComponentsDirective,
  ],
  providers: [D3Service, WhiteboardService, DragService, KeyboardService],
})
export class WhiteboardModule {}
