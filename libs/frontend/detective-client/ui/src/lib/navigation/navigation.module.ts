import { CommonModule } from '@angular/common';
import { NavigationComponent } from './components';
import { NavigationMaterialModule } from './navigation.material.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  declarations: [NavigationComponent],
  imports: [CommonModule, TranslocoModule, NavigationMaterialModule, RouterModule],
  exports: [NavigationComponent],
})
export class NavigationModule {}
