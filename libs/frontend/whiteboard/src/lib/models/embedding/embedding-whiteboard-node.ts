import {
  IEmbeddingNode,
  IEmbeddingNodeTemporaryData,
  IEmbeddingWhiteboardNode,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';

export class EmbeddingWhiteboardNode implements IEmbeddingWhiteboardNode {
  type = WhiteboardNodeType.EMBEDDING;

  constructor(
    public id: string,
    public title: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public locked: boolean,
    public author: string,
    public editors: string[] | undefined,
    public lastUpdatedBy: string,
    public lastUpdated: string,
    public created: string,
    public temporary: IEmbeddingNodeTemporaryData | undefined
  ) {}

  static Build(nodeInput: IEmbeddingNode): EmbeddingWhiteboardNode {
    try {
      return new EmbeddingWhiteboardNode(
        nodeInput.id,
        nodeInput.title,
        nodeInput.x,
        nodeInput.y,
        nodeInput.width,
        nodeInput.height,
        nodeInput.locked,
        nodeInput.author,
        nodeInput.editors,
        nodeInput.lastUpdatedBy,
        nodeInput.lastUpdated,
        nodeInput.created,
        nodeInput?.temporary
      );
    } catch (e) {
      throw new Error(`Could not instantiate ${EmbeddingWhiteboardNode.name}: ${e}`);
    }
  }
}
