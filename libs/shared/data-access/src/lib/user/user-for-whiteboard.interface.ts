import { IUser } from './user.interface';

export type IUserForWhiteboard = Pick<
  IUser,
  'id' | 'email' | 'firstname' | 'lastname' | 'title' | 'role' | 'avatarUrl'
>;
