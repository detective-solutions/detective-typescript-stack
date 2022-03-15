import { Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { ITableCellData, TableCellTypes } from '../interfaces/table-cell-data.interface';

import { AccessIndicatorTableCellComponent } from './access-indicator-table-cell/access-indicator-table-cell.component';
import { FavorizedTableCellComponent } from './favorized-table-cell/favorized-table-cell.component';
import { ICasefileEvent } from '@detective.solutions/frontend/shared/data-access';
import { MultiTableCellComponent } from './multi-table-cell/multi-table-cell.component';
import { Subject } from 'rxjs';
import { TextTableCellComponent } from './text-table-cell/text-table-cell.component';
import { UserAvatarListTableCellComponent } from './user-avatar-list-table-cell/user-avatar-list-table-cell.component';

@Directive({
  selector: '[dynamicTableCell]',
})
export class DynamicTableCellDirective implements OnInit {
  @Input() casefileId!: string;
  @Input() tableCellData!: ITableCellData;
  @Input() tableCellEvents$!: Subject<ICasefileEvent>;

  constructor(private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    if (!this.tableCellData) return;
    this.viewContainerRef.clear();

    switch (this.tableCellData.type) {
      case TableCellTypes.TEXT_TABLE_CELL: {
        const componentRef = this.viewContainerRef.createComponent(TextTableCellComponent);
        componentRef.instance.text = this.tableCellData.text;
        break;
      }
      case TableCellTypes.HTML_TABLE_CELL: {
        const componentRef = this.viewContainerRef.createComponent(MultiTableCellComponent);
        componentRef.instance.casefileId = this.casefileId;
        componentRef.instance.imageSrc = this.tableCellData.imageSrc;
        componentRef.instance.header = this.tableCellData.header;
        componentRef.instance.description = this.tableCellData.description;
        break;
      }
      case TableCellTypes.ACCESS_TABLE_CELL: {
        const componentRef = this.viewContainerRef.createComponent(AccessIndicatorTableCellComponent);
        componentRef.instance.casefileId = this.casefileId;
        componentRef.instance.accessState = this.tableCellData.accessState;
        componentRef.instance.tableCellEvents$ = this.tableCellEvents$;
        break;
      }
      case TableCellTypes.FAVORIZED_TABLE_CELL: {
        const componentRef = this.viewContainerRef.createComponent(FavorizedTableCellComponent);
        componentRef.instance.casefileId = this.casefileId;
        componentRef.instance.isFavorized = this.tableCellData.favorized;
        componentRef.instance.tableCellEvents$ = this.tableCellEvents$;
        break;
      }
      case TableCellTypes.USER_AVATAR_LIST_TABLE_CELL: {
        const componentRef = this.viewContainerRef.createComponent(UserAvatarListTableCellComponent);
        componentRef.instance.userAvatars = this.tableCellData.userAvatars;
        break;
      }
    }
  }
}
