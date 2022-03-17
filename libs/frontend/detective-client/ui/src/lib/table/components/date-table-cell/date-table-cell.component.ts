import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'text-table-cell',
  template: '{{date | date: "longDate"}}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTableCellComponent {
  date!: string;
}
