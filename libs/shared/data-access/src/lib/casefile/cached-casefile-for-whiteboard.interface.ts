import { AnyWhiteboardNode } from '../whiteboard';
import { ICasefileForWhiteboard } from './casefile-for-whiteboard.interface';
import { IUser } from '../user';

export interface ICachedCasefileForWhiteboard extends ICasefileForWhiteboard {
  nodes: AnyWhiteboardNode[];
  temporary: {
    activeUsers: IUser[];
  };
}
