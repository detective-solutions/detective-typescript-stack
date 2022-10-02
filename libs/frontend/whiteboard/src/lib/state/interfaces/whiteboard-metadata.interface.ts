import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';

export interface IWhiteboardMetadataState {
  id: string;
  title: string;
  description?: string;
  activeUsers: IUserForWhiteboard[];
}
