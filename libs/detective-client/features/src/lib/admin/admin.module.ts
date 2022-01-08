import { AdminContainerComponent } from './admin-container/admin-container.component';
import { AdminMaterialModule } from './admin.material.module';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';
import { ConnectionsComponent } from './connections/connections.component';
import { GroupsComponent } from './groups/groups.component';
import { MasksComponent } from './masks/masks.component';
import { NavigationModule } from '@detective.solutions/detective-client/ui';
import { NgModule } from '@angular/core';
import { TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { langScopeLoader } from '@detective.solutions/shared/i18n';

@NgModule({
  declarations: [AdminContainerComponent, ConnectionsComponent, GroupsComponent, MasksComponent],
  imports: [CommonModule, AdminRoutingModule, AdminMaterialModule, NavigationModule],
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
