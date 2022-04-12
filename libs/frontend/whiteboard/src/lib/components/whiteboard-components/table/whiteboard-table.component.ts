import { Component, ViewEncapsulation } from '@angular/core';

import { ColDef } from 'ag-grid-community';
import { WhiteboardBaseComponent } from '../base/base-whiteboard.component';

@Component({
  selector: '[node]',
  templateUrl: './whiteboard-table.component.html',
  styleUrls: ['./whiteboard-table.component.scss', '../base/base-whiteboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WhiteboardTableComponent extends WhiteboardBaseComponent {
  columnDefs: ColDef[] = [
    { field: 'make', sortable: true, filter: true, suppressMovable: true },
    { field: 'model' },
    { field: 'price' },
    { field: 'make' },
    { field: 'model' },
    { field: 'price' },
  ];

  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 },
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 },
  ];
}
