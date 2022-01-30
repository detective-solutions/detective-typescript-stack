import { CasefileEvent, CasefileEventType } from '@detective.solutions/frontend/shared/data-access';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Subject } from 'rxjs';

@Component({
  selector: 'favorized-table-cell',
  templateUrl: 'favorized-table-cell.component.html',
  styleUrls: ['favorized-table-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavorizedTableCellComponent {
  casefileId!: string;
  isFavorized = false;
  tableCellEvents$!: Subject<CasefileEvent>;

  favorize() {
    // TODO: Handle error case
    this.isFavorized = !this.isFavorized;
    this.isFavorized
      ? this.tableCellEvents$.next({ casefileId: this.casefileId, type: CasefileEventType.FAVORIZE, value: true })
      : this.tableCellEvents$.next({ casefileId: this.casefileId, type: CasefileEventType.FAVORIZE, value: false });
  }
}
