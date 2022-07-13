import { ColDef, ColGroupDef } from 'ag-grid-community';

import { IForceDirectedNode } from './d3';

interface INodeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface INodeInput {
  id: string;
  type: string;
  title: string;
  locked?: boolean;
  layout: INodeLayout;
  colDefs?: (ColDef | ColGroupDef)[];
  rowData?: object[];
}

export interface INode extends IForceDirectedNode {
  id: string;
  type: string;
  title: string;
  locked?: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  colDefs: (ColDef | ColGroupDef)[]; // TODO: Move to own interface
  rowData: object[]; // TODO: Move to own interface
}
