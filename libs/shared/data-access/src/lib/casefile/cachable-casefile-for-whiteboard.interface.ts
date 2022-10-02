import { AnyWhiteboardNode } from '../whiteboard';
import { ICasefileForWhiteboard } from './casefile-for-whiteboard.interface';
import { IUser } from '../user';

export interface ICachableCasefileForWhiteboard extends Pick<ICasefileForWhiteboard, 'id' | 'title' | 'description'> {
  nodes: AnyWhiteboardNode[];
  temporary: {
    activeUsers: IUser[];
  };
}
