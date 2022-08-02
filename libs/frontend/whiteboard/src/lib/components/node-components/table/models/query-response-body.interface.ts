import { ColDef, ColGroupDef } from 'ag-grid-community';

export interface IQueryResponse {
  tableSchema: (ColDef | ColGroupDef)[];
  tableData: object[];
}
