import { CasefileEventType, EventService } from '@detective.solutions/frontend/shared/data-access';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'favorized-table-cell',
  templateUrl: 'favorized-table-cell.component.html',
  styleUrls: ['favorized-table-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavorizedTableCellComponent {
  casefileId!: string;
  isFavorized = false;

  constructor(private readonly eventService: EventService) {}

  favorize() {
    // TODO: Handle error case
    this.isFavorized = !this.isFavorized;
    this.isFavorized
      ? this.eventService.tableCellEvents$.next({
          casefileId: this.casefileId,
          type: CasefileEventType.FAVORIZE,
          value: true,
        })
      : this.eventService.tableCellEvents$.next({
          casefileId: this.casefileId,
          type: CasefileEventType.FAVORIZE,
          value: false,
        });
  }
}
