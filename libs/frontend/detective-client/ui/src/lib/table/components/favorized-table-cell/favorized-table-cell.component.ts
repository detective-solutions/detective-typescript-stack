import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IFavorizedTableCell, TableCellEventType } from '../../models';

import { TableCellEventService } from '../../services';

@Component({
  selector: 'favorized-table-cell',
  templateUrl: 'favorized-table-cell.component.html',
  styleUrls: ['favorized-table-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavorizedTableCellComponent {
  cellData!: IFavorizedTableCell; // Will be populated by the DynamicTableDirective

  constructor(private readonly tableCellEventService: TableCellEventService) {}

  favorize() {
    // TODO: Handle error case
    this.cellData.isFavorized = !this.cellData.isFavorized;
    this.cellData.isFavorized
      ? this.tableCellEventService.tableCellEvents$.next({
          id: this.cellData.id,
          type: TableCellEventType.FAVORIZE,
          value: true,
        })
      : this.tableCellEventService.tableCellEvents$.next({
          id: this.cellData.id,
          type: TableCellEventType.FAVORIZE,
          value: false,
        });
  }
}
