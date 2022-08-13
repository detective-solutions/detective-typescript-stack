import { ITableNode, ITableNodeTemporaryData } from './table-node.interface';

import { ITableWhiteboardNode } from './table-whiteboard-node.interface';
import { IUser } from '@detective.solutions/shared/data-access';
import { WhiteboardNodeType } from '../whiteboard-node-types.enum';

export class TableWhiteboardNode implements ITableWhiteboardNode {
  type = WhiteboardNodeType.TABLE;

  constructor(
    public id: string,
    public name: string,
    public title: string,
    public description: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public locked: boolean,
    public lastUpdatedBy: IUser,
    public lastUpdated: string,
    public created: string,
    public temporary: ITableNodeTemporaryData | undefined
  ) {}

  static Build(nodeInput: ITableNode) {
    try {
      return new TableWhiteboardNode(
        nodeInput.id,
        nodeInput.name,
        nodeInput?.title ?? nodeInput.name,
        nodeInput?.description ?? '',
        nodeInput.x,
        nodeInput.y,
        nodeInput.width,
        nodeInput.height,
        nodeInput.locked,
        nodeInput.lastUpdatedBy,
        nodeInput.lastUpdated,
        nodeInput.created,
        nodeInput?.temporary
      );
    } catch (e) {
      throw new Error(`Could not instantiate ${TableWhiteboardNode.name}: ${e}`);
    }
  }
}
