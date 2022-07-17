import { INode } from './node.interface';
import { INodeInput } from './node-input.interface';

/* eslint-disable @typescript-eslint/no-unused-vars */

export abstract class Node implements INode {
  static defaultWidth = 900;
  static defaultHeight = 500;

  fx!: number | null;
  fy!: number | null;

  constructor(
    public id = '',
    public type = '',
    public title = '',
    public locked = false,
    public x = 0,
    public y = 0,
    public width = Node.defaultWidth,
    public height = Node.defaultHeight
  ) {}

  static Build(_nodeInput: INodeInput) {
    throw new Error('Build method is not implemented');
  }
}
