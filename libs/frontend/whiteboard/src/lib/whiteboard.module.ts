import { D3Service, WhiteboardService } from './services';
import { DraggableDirective, ZoomableDirective } from './directives';
import { HostComponent, SidebarComponent, TableComponent, TestLinkComponent, TestNodeComponent } from './components';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { WhiteboardMaterialModule } from './whiteboard.material.module';
import { WhiteboardRoutingModule } from './whiteboard-routing.module';

@NgModule({
  imports: [CommonModule, WhiteboardRoutingModule, WhiteboardMaterialModule],
  declarations: [
    HostComponent,
    SidebarComponent,
    TestNodeComponent,
    TestLinkComponent,
    DraggableDirective,
    ZoomableDirective,
    TableComponent,
  ],
  providers: [D3Service, WhiteboardService],
})
export class WhiteboardModule {}
