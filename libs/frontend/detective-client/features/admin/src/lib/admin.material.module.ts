import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { NgModule } from '@angular/core';

const modules = [
  MatButtonModule,
  MatIconModule,
  MatDialogModule,
  MatSelectModule,
  MatProgressBarModule,
  FlexLayoutModule,
];

@NgModule({
  exports: modules,
})
export class AdminMaterialModule {}
