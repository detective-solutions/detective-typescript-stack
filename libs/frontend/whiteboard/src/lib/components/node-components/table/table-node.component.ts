import { Component, ViewEncapsulation } from '@angular/core';
import { filter, map } from 'rxjs';

import { BaseNodeComponent } from '../base/base-node.component';
import { CustomLoadingOverlayComponent } from './components';
import { GridOptions } from 'ag-grid-community';
import { select } from '@ngrx/store';
import { selectEntities } from './state';

@Component({
  selector: '[node]',
  templateUrl: './table-node.component.html',
  styleUrls: ['./table-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableNodeComponent extends BaseNodeComponent {
  gridOptions: GridOptions = {
    loadingOverlayComponent: CustomLoadingOverlayComponent,
    loadingOverlayComponentParams: { loadingMessage: 'Data is loading...' },
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  // TODO: Move this logic to an independent selector
  getTableData$ = this.store.pipe(
    select(selectEntities),
    filter((entities: any) => entities[this.node.id]),
    map((entities: any) => entities[this.node.id])
  );

  columnDefs$ = this.getTableData$.pipe(map((data) => data.colDefs));
  rowData$ = this.getTableData$.pipe(map((data) => data.rowData));
}
