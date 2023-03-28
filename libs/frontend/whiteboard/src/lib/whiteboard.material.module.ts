import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';

const modules = [
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatTooltipModule,
  MatMenuModule,
  MatInputModule,
  MatProgressSpinnerModule,
  DragDropModule,
  FlexLayoutModule,
];

@NgModule({
  exports: modules,
})
export class WhiteboardMaterialModule {}
