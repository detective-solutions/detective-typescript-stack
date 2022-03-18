import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IDateTableCell } from '../../interfaces';

@Component({
  selector: 'date-table-cell',
  template: '{{cellData.date | date: "longDate"}}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTableCellComponent {
  cellData!: IDateTableCell; // Will be populated by the DynamicTableDirective
}
