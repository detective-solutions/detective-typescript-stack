import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ILinkTableCell } from '../../models';

@Component({
  selector: 'link-table-cell',
  template: '<a href="{{cellData.link}}">{{cellData.text}}</a>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkTableCellComponent {
  cellData!: ILinkTableCell; // Will be populated by the DynamicTableDirective
}
