import {
  IDisplayNode,
  IDisplayNodeTemporaryData,
  IDisplayWhiteboardNode,
  IFileHandle,
  IUser,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';

export class DisplayWhiteboardNode implements IDisplayWhiteboardNode {
  type = WhiteboardNodeType.DISPLAY;

  constructor(
    public id: string,
    public title: string,
    public fileName: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public locked: boolean,
    public file: IFileHandle,
    public author: string,
    public editors: IUser[],
    public lastUpdatedBy: string,
    public lastUpdated: string,
    public created: string,
    public pageCount?: number | undefined,
    public currentIndex?: number | undefined,
    public pages?: string[] | undefined,
    public currentLink?: string | undefined,
    public expires?: Date,
    public temporary?: IDisplayNodeTemporaryData | undefined
  ) {}

  static Build(nodeInput: IDisplayNode): DisplayWhiteboardNode {
    try {
      return new DisplayWhiteboardNode(
        nodeInput.id,
        nodeInput.title,
        nodeInput.fileName,
        nodeInput.x,
        nodeInput.y,
        nodeInput.width,
        nodeInput.height,
        nodeInput.locked,
        nodeInput.file,
        nodeInput.author,
        nodeInput.editors,
        nodeInput.lastUpdatedBy,
        nodeInput.lastUpdated,
        nodeInput.created,
        nodeInput?.pageCount,
        nodeInput?.currentIndex,
        nodeInput?.pages,
        nodeInput?.currentLink,
        nodeInput?.expires,
        nodeInput?.temporary
      );
    } catch (e) {
      throw new Error(`Could not instantiate ${DisplayWhiteboardNode.name}: ${e}`);
    }
  }
}
