import { D3Service, DragService, WebsocketService, WhiteboardService } from './services';
import { DynamicNodeGeneratorDirective, IFrameTrackerDirective } from './directives';
import {
  HostComponent,
  NodeHeaderComponent,
  NodeSelectionHaloComponent,
  SidebarComponent,
  TableNodeComponent,
  TestLinkComponent,
} from './components';
import { METADATA_STORE_NAME, NODES_STORE_NAME, WhiteboardMetadataEffects, whiteboardMetadataReducer } from './state';
import { TableNodeEffects, tableNodeReducer } from './components/node-components/table/state';

import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { TableActionsMenuComponent } from './components/node-components/table/components';
import { WhiteboardMaterialModule } from './whiteboard.material.module';
import { WhiteboardRoutingModule } from './whiteboard-routing.module';

@NgModule({
  imports: [
    CommonModule,
    AgGridModule,
    WhiteboardRoutingModule,
    EffectsModule.forFeature([WhiteboardMetadataEffects, TableNodeEffects]),
    StoreModule.forFeature(NODES_STORE_NAME, tableNodeReducer),
    StoreModule.forFeature(METADATA_STORE_NAME, whiteboardMetadataReducer),
    WhiteboardMaterialModule,
  ],
  declarations: [
    HostComponent,
    SidebarComponent,
    NodeHeaderComponent,
    NodeSelectionHaloComponent,
    TableActionsMenuComponent,
    TestLinkComponent,
    TableNodeComponent,
    IFrameTrackerDirective,
    DynamicNodeGeneratorDirective,
  ],
  providers: [D3Service, WhiteboardService, WebsocketService, DragService, KeyboardService],
})
export class WhiteboardModule {}
