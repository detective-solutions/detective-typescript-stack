import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IStateTableCell, SourceConnectionState } from '../../models';

import { TOOLTIP_DELAY } from '@detective.solutions/frontend/shared/ui';

@Component({
  selector: 'state-table-cell',
  templateUrl: 'state-table-cell.component.html',
  styleUrls: ['state-table-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateTableCellComponent implements OnInit {
  readonly tooltipDelay = TOOLTIP_DELAY;

  cellData!: IStateTableCell; // Will be populated by the DynamicTableDirective

  isInitializing = false;
  isReady = false;
  hasError = false;

  get errorMessage() {
    return this.cellData.message ?? '';
  }

  ngOnInit() {
    switch (this.cellData.state) {
      case SourceConnectionState.READY:
        this.isReady = true;
        break;
      case SourceConnectionState.ERROR:
        this.hasError = true;
        break;
      default:
        this.isInitializing = true;
    }
  }
}
