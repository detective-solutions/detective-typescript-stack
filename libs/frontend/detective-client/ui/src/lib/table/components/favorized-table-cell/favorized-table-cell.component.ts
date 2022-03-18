import { CasefileEventType, EventService } from '@detective.solutions/frontend/shared/data-access';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IFavorizedTableCell } from '../../interfaces';

@Component({
  selector: 'favorized-table-cell',
  templateUrl: 'favorized-table-cell.component.html',
  styleUrls: ['favorized-table-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavorizedTableCellComponent {
  cellData!: IFavorizedTableCell; // Will be populated by the DynamicTableDirective

  constructor(private readonly eventService: EventService) {}

  favorize() {
    // TODO: Handle error case
    this.cellData.isFavorized = !this.cellData.isFavorized;
    this.cellData.isFavorized
      ? this.eventService.tableCellEvents$.next({
          id: this.cellData.id,
          type: CasefileEventType.FAVORIZE,
          value: true,
        })
      : this.eventService.tableCellEvents$.next({
          id: this.cellData.id,
          type: CasefileEventType.FAVORIZE,
          value: false,
        });
  }
}
