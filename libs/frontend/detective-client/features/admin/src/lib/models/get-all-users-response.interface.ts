import { IUser } from '@detective.solutions/shared/data-access';

export interface IGetAllUsersResponse {
  users: IUser[];
  totalElementsCount: number;
}
