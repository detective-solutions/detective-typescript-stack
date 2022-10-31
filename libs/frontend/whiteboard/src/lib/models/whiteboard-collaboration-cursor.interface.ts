import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';

export interface IWhiteboardCollaborationCursor {
  x: number;
  y: number;
  userInfo: IUserForWhiteboard;
  timeout: number;
}
