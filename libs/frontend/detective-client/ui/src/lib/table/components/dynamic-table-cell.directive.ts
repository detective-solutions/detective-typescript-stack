import { ComponentRef, Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { TableCellData, TableCellTypes } from '../interfaces/table-cell-data.interface';

import { AccessIndicatorTableCellComponent } from './access-indicator-table-cell/access-indicator-table-cell.component';
import { DateTableCellComponent } from './date-table-cell/date-table-cell.component';
import { FavorizedTableCellComponent } from './favorized-table-cell/favorized-table-cell.component';
import { IconButtonTableCellComponent } from './icon-button-table-cell/icon-button-table-cell.component';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { MultiTableCellComponent } from './multi-table-cell/multi-table-cell.component';
import { TextTableCellComponent } from './text-table-cell/text-table-cell.component';
import { UserAvatarListTableCellComponent } from './user-avatar-list-table-cell/user-avatar-list-table-cell.component';

type TableCellComponents =
  | AccessIndicatorTableCellComponent
  | DateTableCellComponent
  | FavorizedTableCellComponent
  | IconButtonTableCellComponent
  | MultiTableCellComponent
  | TextTableCellComponent
  | UserAvatarListTableCellComponent;

@Directive({
  selector: '[dynamicTableCell]',
})
export class DynamicTableCellDirective implements OnInit {
  @Input() tableCellData!: TableCellData;

  constructor(private viewContainerRef: ViewContainerRef, private readonly logService: LogService) {}

  ngOnInit() {
    if (!this.tableCellData) {
      throw new Error('No table cell data provided. Cannot instantiate table cell component.');
    }
    this.viewContainerRef.clear();

    const componentRef = this.getComponentInstanceByType(this.tableCellData.type);
    if (componentRef) {
      componentRef.instance.cellData = this.tableCellData;
    }
  }

  getComponentInstanceByType(componentType: string): ComponentRef<TableCellComponents> | null {
    switch (componentType) {
      case TableCellTypes.ACCESS_TABLE_CELL: {
        return this.viewContainerRef.createComponent(AccessIndicatorTableCellComponent);
      }
      case TableCellTypes.DATE_TABLE_CELL: {
        return this.viewContainerRef.createComponent(DateTableCellComponent);
      }
      case TableCellTypes.FAVORIZED_TABLE_CELL: {
        return this.viewContainerRef.createComponent(FavorizedTableCellComponent);
      }
      case TableCellTypes.ICON_BUTTON_TABLE_CELL: {
        return this.viewContainerRef.createComponent(IconButtonTableCellComponent);
      }
      case TableCellTypes.MULTI_TABLE_CELL: {
        return this.viewContainerRef.createComponent(MultiTableCellComponent);
      }
      case TableCellTypes.TEXT_TABLE_CELL: {
        return this.viewContainerRef.createComponent(TextTableCellComponent);
      }
      case TableCellTypes.USER_AVATAR_LIST_TABLE_CELL: {
        return this.viewContainerRef.createComponent(UserAvatarListTableCellComponent);
      }
      default:
        this.logService.error(`Component type ${componentType} is not supported. Skipping cell initialization.`);
        return null;
    }
  }
}
