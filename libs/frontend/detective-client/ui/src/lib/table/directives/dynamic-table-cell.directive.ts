import {
  AccessIndicatorTableCellComponent,
  DateTableCellComponent,
  FavorizedTableCellComponent,
  IconButtonTableCellComponent,
  MultiTableCellComponent,
  StateTableCellComponent,
  TextTableCellComponent,
  UserAvatarListTableCellComponent,
} from '../components';
import { ComponentRef, Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { TableCellComponents, TableCellData, TableCellTypes } from '../models';

import { LogService } from '@detective.solutions/frontend/shared/error-handling';

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
      case TableCellTypes.STATE_TABLE_CELL: {
        return this.viewContainerRef.createComponent(StateTableCellComponent);
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
