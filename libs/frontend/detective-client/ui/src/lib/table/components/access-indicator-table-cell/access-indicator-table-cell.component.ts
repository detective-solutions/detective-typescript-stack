import { AccessState, IAccessTableCell, TableCellEventType } from '../../interfaces';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Router } from '@angular/router';
import { TableCellEventService } from '../../services';

@Component({
  selector: 'access-indicator-table-cell',
  templateUrl: 'access-indicator-table-cell.component.html',
  styleUrls: ['access-indicator-table-cell.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessIndicatorTableCellComponent implements OnInit {
  cellData!: IAccessTableCell; // Will be populated by the DynamicTableDirective

  noAccess = false;
  accessPending = false;
  accessGranted = false;

  constructor(private readonly router: Router, private readonly tableCellEventService: TableCellEventService) {}

  ngOnInit() {
    switch (this.cellData.accessState) {
      case AccessState.ACCESS_GRANTED:
        this.accessGranted = true;
        break;
      case AccessState.ACCESS_PENDING:
        this.accessPending = true;
        break;
      default:
        this.noAccess = true;
    }
  }

  openTargetUrl() {
    this.router.navigateByUrl(this.cellData.targetUrl);
  }

  requestAccess() {
    // TODO: Handle error case
    this.tableCellEventService.tableCellEvents$.next({ id: this.cellData.id, type: TableCellEventType.REQUEST_ACCESS });
    this.noAccess = false;
    this.accessPending = true;
  }
}
