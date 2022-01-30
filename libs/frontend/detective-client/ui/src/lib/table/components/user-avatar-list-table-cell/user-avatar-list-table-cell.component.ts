import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IUserAvatar } from '../../interfaces/table-cell-data.interface';

@Component({
  selector: 'user-avatar-list-table-cell',
  templateUrl: 'user-avatar-list-table-cell.component.html',
  styleUrls: ['user-avatar-list-table-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarListTableCellComponent {
  userAvatars: IUserAvatar[] = [];
}
