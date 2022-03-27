import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';

const modules = [MatButtonModule, MatIconModule, DragDropModule, FlexLayoutModule];

@NgModule({
  exports: modules,
})
export class WhiteboardMaterialModule {}
