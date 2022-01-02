import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation/navigation.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UiMaterialModule } from './ui.material.module';

@NgModule({
  imports: [CommonModule, UiMaterialModule, RouterModule],
  declarations: [NavigationComponent],
  exports: [NavigationComponent],
})
export class UiModule {}
