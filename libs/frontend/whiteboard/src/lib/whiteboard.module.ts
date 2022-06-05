import {
  BufferService,
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
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';
import { WHITEBOARD_STORE_NAME, WhiteboardMetadataEffects, WhiteboardNodeEffects } from './state';

import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { TableNodeEffects } from './components/node-components/table/state';
import { WhiteboardContextResolver } from './resolvers';
import { WhiteboardFacadeService } from './services';
import { WhiteboardMaterialModule } from './whiteboard.material.module';
import { WhiteboardRoutingModule } from './whiteboard-routing.module';
import { langScopeLoader } from '@detective.solutions/shared/i18n';
// Has to be imported from a separate folder to allow webpack bootstrapping
import { whiteboardFeatureReducers } from './state/reducers';

@NgModule({
  imports: [
    CommonModule,
    AgGridModule,
    WhiteboardRoutingModule,
    TranslocoModule,
    StoreModule.forFeature(WHITEBOARD_STORE_NAME, whiteboardFeatureReducers),
    EffectsModule.forFeature([WhiteboardMetadataEffects, WhiteboardNodeEffects, TableNodeEffects]),
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
    WhiteboardContextResolver,
    WhiteboardFacadeService,
    BufferService,
    D3AdapterService,
    DragService,
    WebSocketService,
    WhiteboardSelectionService,
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
