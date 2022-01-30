import { AccessIndicatorTableCellComponent } from './components/access-indicator-table-cell/access-indicator-table-cell.component';
import { CommonModule } from '@angular/common';
import { DynamicTableCellDirective } from './components/dynamic-table-cell.directive';
import { FavorizedTableCellComponent } from './components/favorized-table-cell/favorized-table-cell.component';
import { MultiTableCellComponent } from './components/multi-table-cell/multi-table-cell.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TableComponent } from './table.component';
import { TableMaterialModule } from './table.material.module';
import { TextTableCellComponent } from './components/text-table-cell/text-table-cell.component';
import { TranslocoModule } from '@ngneat/transloco';
import { UserAvatarListTableCellComponent } from './components/user-avatar-list-table-cell/user-avatar-list-table-cell.component';

@NgModule({
  declarations: [
    TableComponent,
    DynamicTableCellDirective,
    MultiTableCellComponent,
    FavorizedTableCellComponent,
    TextTableCellComponent,
    AccessIndicatorTableCellComponent,
    UserAvatarListTableCellComponent,
  ],
  imports: [CommonModule, TranslocoModule, TableMaterialModule, RouterModule],
  exports: [TableComponent],
})
export class TableModule {}
