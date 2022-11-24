import { Component } from '@angular/core';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';
import { ILoadingOverlayParams } from 'ag-grid-community';

@Component({
  selector: 'table-node-loading-overlay',
  template: `<div><div class="loading-spinner"></div></div>`,
  styles: [''],
})
export class CustomLoadingOverlayComponent implements ILoadingOverlayAngularComp {
  public params!: ILoadingOverlayParams & { loadingMessage: string };

  agInit(params: ILoadingOverlayParams & { loadingMessage: string }) {
    this.params = params;
  }
}
