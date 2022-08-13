import { IEmbeddingNode, IEmbeddingNodeTemporaryData } from './embedding-node.interface';

import { IEmbeddingWhiteboardNode } from './embedding-whiteboard-node.interface';
import { IUser } from '@detective.solutions/shared/data-access';
import { WhiteboardNodeType } from '../whiteboard-node-types.enum';

export class EmbeddingWhiteboardNode implements IEmbeddingWhiteboardNode {
  type = WhiteboardNodeType.EMBEDDING;

  constructor(
    public id: string,
    public title: string,
    public href: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public locked: boolean,
    public author: IUser,
    public editors: IUser[],
    public lastUpdatedBy: IUser,
    public lastUpdated: string,
    public created: string,
    public temporary: IEmbeddingNodeTemporaryData | undefined
  ) {}

  static Build(nodeInput: IEmbeddingNode): EmbeddingWhiteboardNode {
    try {
      return new EmbeddingWhiteboardNode(
        nodeInput.id,
        nodeInput.title,
        nodeInput.href,
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
