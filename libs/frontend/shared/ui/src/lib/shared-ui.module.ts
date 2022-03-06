import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedUiMaterialModule } from './shared-ui.material.module';

@NgModule({
  imports: [CommonModule, RouterModule, SharedUiMaterialModule],
  providers: [],
})
export class SharedUiModule {}
