import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';

export interface IWhiteboardMetadataState {
  id: string;
  title: string;
  titleFocusedBy: string | null;
  description?: string;
  activeUsers: Set<IUserForWhiteboard>;
}
