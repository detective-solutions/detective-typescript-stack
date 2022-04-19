import { IForceDirectedNode } from './d3';

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
  width: number;
  height: number;
}

interface INodeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}
