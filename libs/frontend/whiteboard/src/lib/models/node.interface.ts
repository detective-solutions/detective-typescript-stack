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
}
