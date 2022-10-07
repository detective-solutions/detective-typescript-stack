import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { NgModule } from '@angular/core';

const modules = [
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatDialogModule,
  MatSelectModule,
  MatProgressBarModule,
  FlexLayoutModule,
  MatGridListModule,
];

@NgModule({
  exports: modules,
})
export class AdminMaterialModule {}
