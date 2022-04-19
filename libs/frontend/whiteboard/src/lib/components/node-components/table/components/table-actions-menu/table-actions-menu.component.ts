import { Component } from '@angular/core';

@Component({
  selector: 'table-actions-menu',
  templateUrl: './table-actions-menu.component.html',
  styleUrls: ['./table-actions-menu.component.scss'],
})
export class TableActionsMenuComponent {
  test() {
    console.log('TEST');
  }
}
