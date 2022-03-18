import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';

const modules = [
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule,
  MatProgressBarModule,
  FlexLayoutModule,
];

@NgModule({
  exports: modules,
})
export class TilesMaterialModule {}
