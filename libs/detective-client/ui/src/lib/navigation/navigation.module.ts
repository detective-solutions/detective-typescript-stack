import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation.component';
import { NavigationMaterialModule } from './navigation.material.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  imports: [CommonModule, TranslocoModule, NavigationMaterialModule, RouterModule],
  declarations: [NavigationComponent],
  exports: [NavigationComponent],
})
export class NavigationModule {}
