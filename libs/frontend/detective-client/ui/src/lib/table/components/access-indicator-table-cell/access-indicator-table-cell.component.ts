import { AccessState, IAccessTableCell } from '../../interfaces/table-cell-data.interface';
import { CasefileEventType, EventService } from '@detective.solutions/frontend/shared/data-access';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'access-indicator-table-cell',
  templateUrl: 'access-indicator-table-cell.component.html',
  styleUrls: ['access-indicator-table-cell.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessIndicatorTableCellComponent implements OnInit {
  cellData!: IAccessTableCell;
  casefileId!: string;
  accessState: AccessState = AccessState.NO_ACCESS;

  accessGranted = false;
  accessPending = false;
  noAccess = false;

  constructor(private readonly eventService: EventService) {}

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

  requestAccess() {
    // TODO: Handle error case
    this.eventService.tableCellEvents$.next({ casefileId: this.casefileId, type: CasefileEventType.REQUEST_ACCESS });
    this.noAccess = false;
    this.accessPending = true;
  }
}
