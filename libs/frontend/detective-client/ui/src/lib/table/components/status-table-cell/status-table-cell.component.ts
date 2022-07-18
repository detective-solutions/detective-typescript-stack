import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { IStateTableCell } from '../../models';
import { SourceConnectionStatus } from '@detective.solutions/shared/data-access';
import { TOOLTIP_DELAY } from '@detective.solutions/frontend/shared/ui';

@Component({
  selector: 'status-table-cell',
  templateUrl: 'status-table-cell.component.html',
  styleUrls: ['status-table-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTableCellComponent implements OnInit {
  readonly tooltipDelay = TOOLTIP_DELAY;

  cellData!: IStateTableCell; // Will be populated by the DynamicTableDirective

  isInitializing = false;
  isReady = false;
  hasError = false;

  get errorMessage() {
    return this.cellData.message ?? '';
  }

  ngOnInit() {
    switch (this.cellData.status) {
      case SourceConnectionStatus.AVAILABLE:
        this.isReady = true;
        break;
      case SourceConnectionStatus.ERROR:
        this.hasError = true;
        break;
      default:
        this.isInitializing = true;
    }
  }
}
