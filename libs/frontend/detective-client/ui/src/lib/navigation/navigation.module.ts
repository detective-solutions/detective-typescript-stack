import { CommonModule } from '@angular/common';
import { EventService } from '@detective.solutions/frontend/shared/data-access';
import { NavigationComponent } from './navigation.component';
import { NavigationMaterialModule } from './navigation.material.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  declarations: [NavigationComponent],
  providers: [EventService],
  imports: [CommonModule, TranslocoModule, NavigationMaterialModule, RouterModule],
  exports: [NavigationComponent],
})
export class NavigationModule {}
