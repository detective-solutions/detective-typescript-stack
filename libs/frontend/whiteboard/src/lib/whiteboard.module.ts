import {
  BufferService,
  D3AdapterService,
  DragService,
  WebSocketService,
  WhiteboardSelectionService,
} from './services/internal-services';
import {
  DisplayNodeComponent,
  DisplayNodeEffects,
  EmbeddingNodeComponent,
  HostComponent,
  NodeHeaderComponent,
  NodeSelectionHaloComponent,
  SidebarComponent,
  TableNodeComponent,
  TableNodeEffects,
  TestLinkComponent,
  TopbarComponent,
  WhiteboardLeaveDialogComponent,
} from './components';
import { DisplayService, WhiteboardFacadeService } from './services';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';
import {
  WHITEBOARD_STORE_NAME,
  WhiteboardGeneralEffects,
  WhiteboardMetadataEffects,
  WhiteboardNodeEffects,
} from './state';

import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchTablesByTenantGQL } from './graphql';
import { StoreModule } from '@ngrx/store';
import { WhiteboardContextResolver } from './resolvers';
import { WhiteboardLeaveGuard } from './guards';
import { WhiteboardMaterialModule } from './whiteboard.material.module';
import { WhiteboardRoutingModule } from './whiteboard-routing.module';
import { langScopeLoader } from '@detective.solutions/shared/i18n';
// Has to be imported from a separate folder to allow webpack bootstrapping
import { whiteboardFeatureReducers } from './state/reducers';

@NgModule({
  imports: [
    AgGridModule,
    CommonModule,
    EffectsModule.forFeature([
      WhiteboardGeneralEffects,
      WhiteboardMetadataEffects,
      WhiteboardNodeEffects,
      TableNodeEffects,
      DisplayNodeEffects,
    ]),
    StoreModule.forFeature(WHITEBOARD_STORE_NAME, whiteboardFeatureReducers),
    TranslocoModule,
    ReactiveFormsModule,
    WhiteboardMaterialModule,
    WhiteboardRoutingModule,
  ],
  declarations: [
    EmbeddingNodeComponent,
    HostComponent,
    NodeHeaderComponent,
    NodeSelectionHaloComponent,
    SidebarComponent,
    TableNodeComponent,
    EmbeddingNodeComponent,
    DisplayNodeComponent,
    TestLinkComponent,
    TopbarComponent,
    WhiteboardLeaveDialogComponent,
  ],
  providers: [
    BufferService,
    DragService,
    D3AdapterService,
    KeyboardService,
    WhiteboardContextResolver,
    WhiteboardFacadeService,
    WebSocketService,
    WhiteboardSelectionService,
    DisplayService,
    WhiteboardLeaveGuard,
    SearchTablesByTenantGQL,
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
