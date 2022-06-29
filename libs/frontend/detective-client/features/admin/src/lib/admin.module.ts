import { AdminContainerComponent, ConnectionsComponent, GroupsComponent, MasksComponent } from './components';
import { ConnectionsAddEditDialogComponent, ConnectionsDeleteDialogComponent } from './components/connections/dialog';
import { GetAllConnectionsGQL, GetConnectionByIdGQL } from './graphql';
import { NavigationModule, TableModule } from '@detective.solutions/frontend/detective-client/ui';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';

import { AdminMaterialModule } from './admin.material.module';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';
import { ConnectionsService } from './services';
import { DynamicFormModule } from '@detective.solutions/frontend/shared/dynamic-form';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

@NgModule({
  declarations: [
    AdminContainerComponent,
    ConnectionsComponent,
    ConnectionsAddEditDialogComponent,
    ConnectionsDeleteDialogComponent,
    GroupsComponent,
    MasksComponent,
  ],
  imports: [
    CommonModule,
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
  ],
})
export class AdminModule {}
