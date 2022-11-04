import {
  AdminContainerComponent,
  ConnectionsComponent,
  GroupsComponent,
  MaskingsComponent,
  SubscriptionsComponent,
} from './components';
import { ConnectionsAddEditDialogComponent, ConnectionsDeleteDialogComponent } from './components/connections/dialog';
import { ConnectionsService, MaskingService, SubscriptionService } from './services';
import {
  CreateNewColumnMaskGQL,
  CreateNewMaskingGQL,
  CreateNewRowMaskGQL,
  DeleteColumnMaskGQL,
  DeleteMaskingGQL,
  DeleteRowMaskGQL,
  GetAllColumnsGQL,
  GetAllConnectionsGQL,
  GetAllMaskingsGQL,
  GetAllUserGroupsGQL,
  GetAllUsersGQL,
  GetConnectionByIdGQL,
  GetConnectionByTableIdGQL,
  GetTablesBySourceConnectionIdGQL,
  UpdateMaskingGQL,
} from './graphql';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaskingAddEditDialogComponent, MaskingDeleteDialogComponent } from './components/maskings/dialog';
import { NavigationModule, TableModule } from '@detective.solutions/frontend/detective-client/ui';
import {
  SubscriptionCancelDialogComponent,
  SubscriptionUpgradeDialogComponent,
} from './components/subscriptions/dialog';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

import { AdminMaterialModule } from './admin.material.module';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';
import { DynamicFormModule } from '@detective.solutions/frontend/shared/dynamic-form';
import { GetMaskingByIdGQL } from './graphql/get-masking-by-id.gql';
import { NgModule } from '@angular/core';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

@NgModule({
  declarations: [
    AdminContainerComponent,
    ConnectionsComponent,
    ConnectionsAddEditDialogComponent,
    ConnectionsDeleteDialogComponent,
    GroupsComponent,
    MaskingsComponent,
    MaskingAddEditDialogComponent,
    MaskingDeleteDialogComponent,
    SubscriptionsComponent,
    SubscriptionCancelDialogComponent,
    SubscriptionUpgradeDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    TranslocoModule,
    NavigationModule,
    TableModule,
    ReactiveFormsModule,
    DynamicFormModule,
    AdminMaterialModule,
  ],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: {
        scope: 'admin',
        loader: langScopeLoader((lang: string, root: string) => import(`./${root}/${lang}.json`)),
      },
    },
    ConnectionsService,
    GetConnectionByTableIdGQL,
    GetConnectionByIdGQL,
    GetAllColumnsGQL,
    GetAllConnectionsGQL,
    GetTablesBySourceConnectionIdGQL,
    MaskingService,
    GetAllMaskingsGQL,
    UpdateMaskingGQL,
    GetMaskingByIdGQL,
    DeleteMaskingGQL,
    CreateNewColumnMaskGQL,
    CreateNewRowMaskGQL,
    DeleteColumnMaskGQL,
    DeleteRowMaskGQL,
    GetAllUsersGQL,
    CreateNewMaskingGQL,
    GetAllUserGroupsGQL,
    SubscriptionService,
  ],
})
export class AdminModule {}
