import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation.component';
import { NavigationMaterialModule } from './navigation.material.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, NavigationMaterialModule, RouterModule],
  declarations: [NavigationComponent],
  exports: [NavigationComponent],
})
export class NavigationModule {}
