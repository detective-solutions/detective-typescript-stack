import {
  ITable,
  ITableNode,
  ITableNodeTemporaryData,
  ITableWhiteboardNode,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';

export class TableWhiteboardNode implements ITableWhiteboardNode {
  type = WhiteboardNodeType.TABLE;

  constructor(
    public id: string,
    public title: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public locked: boolean,
    public lastUpdatedBy: string,
    public lastUpdated: string,
    public created: string,
    public entity: Partial<ITable>,
    public temporary: ITableNodeTemporaryData | undefined
  ) {}

  static Build(nodeInput: ITableNode) {
    try {
      return new TableWhiteboardNode(
        nodeInput.id,
        nodeInput?.title ?? nodeInput.entity.name,
        nodeInput.x,
        nodeInput.y,
        nodeInput.width,
        nodeInput.height,
        nodeInput.locked,
        nodeInput.lastUpdatedBy,
        nodeInput.lastUpdated,
        nodeInput.created,
        nodeInput.entity,
        nodeInput?.temporary
      );
    } catch (e) {
      throw new Error(`Could not instantiate ${TableWhiteboardNode.name}: ${e}`);
    }
  }
}
