import {
  AdminContainerComponent,
  ConnectionsComponent,
  MaskingsComponent,
  SubscriptionsComponent,
  UserGroupsComponent,
  UsersComponent,
} from './components';
import { ConnectionsAddEditDialogComponent, ConnectionsDeleteDialogComponent } from './components/connections/dialog';
import { ConnectionsService, MaskingService, SubscriptionService, UsersService } from './services';
import {
  CreateNewColumnMaskGQL,
  CreateNewMaskingGQL,
  CreateUserGroupGQL,
  DeleteColumnMaskGQL,
  DeleteMaskingGQL,
  DeleteRowMaskGQL,
  DeleteUserByIdGQL,
  DeleteUserGroupByIdGQL,
  GetAllColumnsGQL,
  GetAllConnectionsGQL,
  GetAllMaskingsGQL,
  GetAllUserGroupsAsDropDownValuesGQL,
  GetAllUserGroupsGQL,
  GetAllUsersGQL,
  GetConnectionByIdGQL,
  GetMaskingByUserGroupIdGQL,
  GetTablesBySourceConnectionIdGQL,
  GetUserByIdGQL,
  GetUserGroupByIdGQL,
  SearchConnectionsByTenantGQL,
  SearchUserGroupMembersByTenantIdGQL,
  SearchUserGroupsByTenantGQL,
  SearchUsersByTenantGQL,
  UpdateMaskingGQL,
  UpdateUserGroupGQL,
  UpdateUserRoleGQL,
} from './graphql';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaskingAddEditDialogComponent, MaskingDeleteDialogComponent } from './components/maskings/dialog';
import { NavigationModule, TableModule } from '@detective.solutions/frontend/detective-client/ui';
import {
  SubscriptionCancelDialogComponent,
  SubscriptionUpgradeDialogComponent,
} from './components/subscriptions/dialog';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';
import { UserGroupsAddEditDialogComponent, UserGroupsDeleteComponent } from './components/user-groups/dialog';

import { AdminMaterialModule } from './admin.material.module';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';
import { DynamicFormModule } from '@detective.solutions/frontend/shared/dynamic-form';
import { GetMaskingByIdGQL } from './graphql/get-masking-by-id.gql';
import { NgModule } from '@angular/core';
import { UserEditDialogComponent } from './components/users/dialog/users-edit-dialog.component';
import { UsersDeleteDialogComponent } from './components/users/dialog';
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
    UsersDeleteDialogComponent,
    UserEditDialogComponent,
    UserGroupsComponent,
    UserGroupsDeleteComponent,
    UserGroupsAddEditDialogComponent,
    MaskingsComponent,
    MaskingAddEditDialogComponent,
    MaskingDeleteDialogComponent,
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
    MaskingService,
    SubscriptionService,
    UsersService,
    GetAllConnectionsGQL,
    GetTablesBySourceConnectionIdGQL,
    GetConnectionByIdGQL,
    CreateNewColumnMaskGQL,
    GetMaskingByIdGQL,
    UpdateMaskingGQL,
    DeleteMaskingGQL,
    DeleteMaskingGQL,
    DeleteRowMaskGQL,
    DeleteColumnMaskGQL,
    GetAllMaskingsGQL,
    GetAllUserGroupsAsDropDownValuesGQL,
    GetAllColumnsGQL,
    SearchConnectionsByTenantGQL,
    SearchUserGroupMembersByTenantIdGQL,
    SearchUserGroupsByTenantGQL,
    SearchUsersByTenantGQL,
    CreateNewMaskingGQL,
    GetAllUserGroupsGQL,
    GetUserGroupByIdGQL,
    GetAllUsersGQL,
    GetUserByIdGQL,
    DeleteUserByIdGQL,
    CreateUserGroupGQL,
    UpdateUserGroupGQL,
    DeleteUserGroupByIdGQL,
    UpdateUserRoleGQL,
    GetMaskingByUserGroupIdGQL,
  ],
})
export class AdminModule {}
