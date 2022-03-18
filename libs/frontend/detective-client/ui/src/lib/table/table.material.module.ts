import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

const modules = [
  MatTableModule,
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatProgressBarModule,
  ScrollingModule,
  FlexLayoutModule,
];

@NgModule({
  exports: modules,
})
export class TableMaterialModule {}
