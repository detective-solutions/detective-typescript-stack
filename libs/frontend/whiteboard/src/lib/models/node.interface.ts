import { IForceDirectedNode } from './d3';

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
