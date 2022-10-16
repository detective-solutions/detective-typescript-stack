import { IUserGroup } from '@detective.solutions/shared/data-access';

export interface IGetAllUserGroupsResponse {
  userGroup: IUserGroup[];
  totalElementsCount: number;
}
