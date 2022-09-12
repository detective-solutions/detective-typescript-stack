import { ColDef, ColGroupDef } from 'ag-grid-community';

import { IGeneralWhiteboardNodeTemporaryData } from '../general-whiteboard-node-temporary-data.interface';
import { ITableOccurrence } from '../../table';

export interface ITableNode extends ITableOccurrence {
  title: string;
  temporary?: ITableNodeTemporaryData;
}

export interface ITableNodeTemporaryData extends IGeneralWhiteboardNodeTemporaryData {
  colDefs?: (ColDef | ColGroupDef)[];
  rowData?: object[];
}
