import { ICasefileForWhiteboard } from './casefile-for-whiteboard.interface';
import { IUser } from '../user';

export interface ICachedCasefileForWhiteboard extends ICasefileForWhiteboard {
  temporary: {
    activeUsers: IUser[];
  };
}
