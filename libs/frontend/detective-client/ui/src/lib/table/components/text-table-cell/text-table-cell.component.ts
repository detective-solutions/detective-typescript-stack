import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'text-table-cell',
  template: '{{text}}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextTableCellComponent {
  text!: string;
}
