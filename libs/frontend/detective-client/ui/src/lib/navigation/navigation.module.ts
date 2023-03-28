import { CommonModule } from '@angular/common';
import { InviteDialogComponent } from './components/dialog';
import { NavigationComponent } from './components';
import { NavigationMaterialModule } from './navigation.material.module';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  declarations: [NavigationComponent, InviteDialogComponent],
  imports: [CommonModule, TranslocoModule, ReactiveFormsModule, NavigationMaterialModule, RouterModule],
  exports: [NavigationComponent],
})
export class NavigationModule {}
