import { ColDef, ColGroupDef } from 'ag-grid-community';

import { INode } from '../../../../models';

export interface ITableNode extends INode {
  temporary?: ITableNodeTemporaryData;
}

export interface ITableNodeTemporaryData {
  colDefs?: (ColDef | ColGroupDef)[];
  rowData?: object[];
}
