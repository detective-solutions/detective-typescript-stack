import { ColDef } from 'ag-grid-community';
import { INode } from '../../../../models';

export interface ITableNode extends INode {
  colDefs: ColDef[];
  rowData: object[];
}
