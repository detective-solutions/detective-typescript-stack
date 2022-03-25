import { CommonModule } from '@angular/common';
import { HostComponent } from './components/host/host.component';
import { NgModule } from '@angular/core';
import { WhiteboardRoutingModule } from './whiteboard-routing.module';

@NgModule({
  imports: [CommonModule, WhiteboardRoutingModule],
  declarations: [HostComponent],
})
export class WhiteboardModule {}
