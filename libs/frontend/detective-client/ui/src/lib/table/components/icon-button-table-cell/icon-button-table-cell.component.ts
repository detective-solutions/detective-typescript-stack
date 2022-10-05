import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IIconButtonTableCell, TableCellEventType } from '../../models';

import { TOOLTIP_DELAY } from '@detective.solutions/frontend/shared/ui';
import { TableCellEventService } from '../../services';

@Component({
  selector: 'icon-button-table-cell',
  templateUrl: 'icon-button-table-cell.component.html',
  styleUrls: ['icon-button-table-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonTableCellComponent {
  readonly tooltipDelay = TOOLTIP_DELAY;

  cellData!: IIconButtonTableCell; // Will be populated by the DynamicTableDirective

  constructor(private readonly tableCellEventService: TableCellEventService) {}

  onClick(clickEventKey: string) {
    this.tableCellEventService.tableCellEvents$.next({
      id: this.cellData.id,
      type: TableCellEventType.ICON_BUTTON_CLICK,
      value: clickEventKey,
    });
  }
}
