import {
  IDisplayNode,
  IDisplayNodeTemporaryData,
  IDisplayWhiteboardNode,
  IUser,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';

export class DisplayWhiteboardNode implements IDisplayWhiteboardNode {
  type = WhiteboardNodeType.DISPLAY;

  constructor(
    public id: string,
    public title: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public locked: boolean,
    public author: string,
    public editors: IUser[],
    public lastUpdatedBy: string,
    public lastUpdated: string,
    public created: string,
    public currentFilePageUrl: string | undefined,
    public currentPageIndex: number | undefined,
    public filePageUrls: string[] | undefined,
    public pageCount: number | undefined,
    public expires: string | undefined,
    public temporary: IDisplayNodeTemporaryData | undefined
  ) {}

  static Build(nodeInput: IDisplayNode): DisplayWhiteboardNode {
    try {
      return new DisplayWhiteboardNode(
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
        nodeInput?.currentFilePageUrl,
        nodeInput?.currentPageIndex,
        nodeInput?.filePageUrls ?? [],
        nodeInput?.pageCount,
        nodeInput?.expires,
        nodeInput?.temporary
      );
    } catch (e) {
      throw new Error(`Could not instantiate ${DisplayWhiteboardNode.name}: ${e}`);
    }
  }
}
