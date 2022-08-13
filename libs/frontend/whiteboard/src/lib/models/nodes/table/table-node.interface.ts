import { ColDef, ColGroupDef } from 'ag-grid-community';

import { ITableOccurrence } from '@detective.solutions/shared/data-access';

export interface ITableNode extends ITableOccurrence {
  title: string;
  temporary?: ITableNodeTemporaryData;
}

export interface ITableNodeTemporaryData {
  colDefs?: (ColDef | ColGroupDef)[];
  rowData?: object[];
}
