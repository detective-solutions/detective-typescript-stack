import { CasefileEventType, EventService } from '@detective.solutions/frontend/shared/data-access';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { AccessState } from '../../interfaces/table-cell-data.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'access-indicator-table-cell',
  templateUrl: 'access-indicator-table-cell.component.html',
  styleUrls: ['access-indicator-table-cell.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessIndicatorTableCellComponent implements OnInit {
  casefileId!: string;
  targetUrl!: string;
  accessState!: AccessState;

  accessGranted = false;
  accessPending = false;
  noAccess = false;

  constructor(private readonly router: Router, private readonly eventService: EventService) {}

  ngOnInit() {
    switch (this.accessState) {
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
    this.router.navigateByUrl(this.targetUrl);
  }

  requestAccess() {
    // TODO: Handle error case
    this.eventService.tableCellEvents$.next({ casefileId: this.casefileId, type: CasefileEventType.REQUEST_ACCESS });
    this.noAccess = false;
    this.accessPending = true;
  }
}
