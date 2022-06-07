import { NavigationModule, TableModule } from '@detective.solutions/frontend/detective-client/ui';

import { AdminContainerComponent } from './components/admin-container.component';
import { AdminMaterialModule } from './admin.material.module';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';
import { ConnectionsComponent } from './components/connections/connections.component';
import { GroupsComponent } from './components/groups/groups.component';
import { MasksComponent } from './components/masks/masks.component';
import { NgModule } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

@NgModule({
  declarations: [AdminContainerComponent, ConnectionsComponent, GroupsComponent, MasksComponent],
  imports: [CommonModule, AdminRoutingModule, NavigationModule, TableModule, AdminMaterialModule],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: {
        scope: 'admin',
        loader: langScopeLoader((lang: string, root: string) => import(`./${root}/${lang}.json`)),
      },
    },
  ],
})
export class AdminModule {}
