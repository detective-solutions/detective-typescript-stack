import { IUser } from './user.interface';

export type IUserForWhiteboard = { email: string; firstname: string; lastname: string; avatarUrl: string } & Pick<
  IUser,
  'id' | 'title' | 'role'
>;
