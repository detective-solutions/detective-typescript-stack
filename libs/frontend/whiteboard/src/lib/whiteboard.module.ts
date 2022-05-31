import {
  D3AdapterService,
  DragService,
  WebSocketService,
  WhiteboardSelectionService,
} from './services/internal-services';
import { DynamicNodeGeneratorDirective, IFrameTrackerDirective } from './directives';
import {
  HostComponent,
  NodeHeaderComponent,
  NodeSelectionHaloComponent,
  SidebarComponent,
  TableNodeComponent,
  TestLinkComponent,
} from './components';
import {
  METADATA_STORE_NAME,
  NODES_STORE_NAME,
  WhiteboardMetadataEffects,
  whiteboardMetadataReducer,
  whiteboardNodesReducer,
} from './state';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { TableNodeEffects } from './components/node-components/table/state';
import { WhiteboardFacadeService } from './services';
import { WhiteboardMaterialModule } from './whiteboard.material.module';
import { WhiteboardRoutingModule } from './whiteboard-routing.module';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

@NgModule({
  imports: [
    CommonModule,
    AgGridModule,
    WhiteboardRoutingModule,
    TranslocoModule,
    EffectsModule.forFeature([WhiteboardMetadataEffects, TableNodeEffects]),
    StoreModule.forFeature(NODES_STORE_NAME, whiteboardNodesReducer),
    StoreModule.forFeature(METADATA_STORE_NAME, whiteboardMetadataReducer),
    WhiteboardMaterialModule,
  ],
  declarations: [
    HostComponent,
    SidebarComponent,
    NodeHeaderComponent,
    NodeSelectionHaloComponent,
    TestLinkComponent,
    TableNodeComponent,
    IFrameTrackerDirective,
    DynamicNodeGeneratorDirective,
  ],
  providers: [
    WhiteboardFacadeService,
    WhiteboardSelectionService,
    D3AdapterService,
    WebSocketService,
    DragService,
    KeyboardService,
    {
      provide: TRANSLOCO_SCOPE,
      useValue: {
        scope: 'whiteboard',
        loader: langScopeLoader((lang: string, root: string) => import(`./${root}/${lang}.json`)),
      },
    },
  ],
})
export class WhiteboardModule {}
