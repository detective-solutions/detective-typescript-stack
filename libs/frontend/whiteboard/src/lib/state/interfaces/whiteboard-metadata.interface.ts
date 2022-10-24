import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';

export interface IWhiteboardMetadataState {
  id: string;
  title: string;
  isTitleFocused: boolean;
  description?: string;
  activeUsers: IUserForWhiteboard[];
}
