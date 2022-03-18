import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IUserAvatarListTableCell } from '../../interfaces';

@Component({
  selector: 'user-avatar-list-table-cell',
  templateUrl: 'user-avatar-list-table-cell.component.html',
  styleUrls: ['user-avatar-list-table-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarListTableCellComponent {
  cellData!: IUserAvatarListTableCell; // Will be populated by the DynamicTableDirective
}
