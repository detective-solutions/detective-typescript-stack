import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';

const modules = [
  MatTableModule,
  MatPaginatorModule,
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  FlexLayoutModule,
];

@NgModule({
  exports: modules,
})
export class TableMaterialModule {}
