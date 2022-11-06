import {
  AdminContainerComponent,
  ConnectionsComponent,
  GroupsComponent,
  MasksComponent,
  SubscriptionsComponent,
  UsersComponent,
} from './components';
import { ConnectionsAddEditDialogComponent, ConnectionsDeleteDialogComponent } from './components/connections/dialog';
import { ConnectionsService, MaskingsService, SubscriptionService, UsersService } from './services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  GetAllConnectionsGQL,
  GetAllMaskingsGQL,
  GetAllUserGroupsGQL,
  GetAllUsersGQL,
  GetConnectionByIdGQL,
} from './graphql';
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
import { NgModule } from '@angular/core';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

@NgModule({
  declarations: [
    AdminContainerComponent,
    ConnectionsComponent,
    ConnectionsAddEditDialogComponent,
    ConnectionsDeleteDialogComponent,
    SubscriptionCancelDialogComponent,
    SubscriptionUpgradeDialogComponent,
    UsersComponent,
    GroupsComponent,
    MasksComponent,
    SubscriptionsComponent,
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
    GetConnectionByIdGQL,
    GetAllConnectionsGQL,
    MaskingsService,
    GetAllMaskingsGQL,
    GetAllUserGroupsGQL,
    GetAllUsersGQL,
    SubscriptionService,
    UsersService,
  ],
})
export class AdminModule {}
