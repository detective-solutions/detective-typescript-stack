import { AnyWhiteboardNode } from '../whiteboard';
import { ICasefileForWhiteboard } from './casefile-for-whiteboard.interface';
import { IUserForWhiteboard } from '../user';

export interface ICachableCasefileForWhiteboard extends Pick<ICasefileForWhiteboard, 'xid' | 'title' | 'description'> {
  nodes: AnyWhiteboardNode[];
  temporary: {
    activeUsers: IUserForWhiteboard[];
  };
}
