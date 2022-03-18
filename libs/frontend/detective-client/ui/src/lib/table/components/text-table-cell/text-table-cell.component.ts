import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ITextTableCell } from '../../interfaces';

@Component({
  selector: 'text-table-cell',
  template: '{{cellData.text}}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextTableCellComponent {
  cellData!: ITextTableCell; // Will be populated by the DynamicTableDirective
}
