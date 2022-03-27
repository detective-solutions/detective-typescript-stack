import { DraggableDirective, ZoomableDirective } from './directives';
import { HostComponent, SidebarComponent, TestLinkComponent, TestNodeComponent } from './components';

import { CommonModule } from '@angular/common';
import { D3Service } from './services/d3.service';
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
  ],
  providers: [D3Service],
})
export class WhiteboardModule {}
