import { UserGroupDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllUserGroupsResponse {
  userGroups: UserGroupDTO[];
  totalElementsCount: number;
}
