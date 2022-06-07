import {
  AccessIndicatorTableCellComponent,
  DateTableCellComponent,
  DynamicTableCellDirective,
  FavorizedTableCellComponent,
  IconButtonTableCellComponent,
  MultiTableCellComponent,
  TextTableCellComponent,
  UserAvatarListTableCellComponent,
} from './components';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TableCellEventService } from './services';
import { TableComponent } from './table.component';
import { TableMaterialModule } from './table.material.module';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  declarations: [
    TableComponent,
    DynamicTableCellDirective,
    AccessIndicatorTableCellComponent,
    DateTableCellComponent,
    FavorizedTableCellComponent,
    IconButtonTableCellComponent,
    TextTableCellComponent,
    MultiTableCellComponent,
    UserAvatarListTableCellComponent,
  ],
  imports: [CommonModule, TranslocoModule, RouterModule, TableMaterialModule],
  providers: [TableCellEventService],
  exports: [TableComponent],
})
export class TableModule {}
