import { IUser } from '../user';

export type UserGroupMember = Pick<IUser, 'id' | 'email' | 'firstname' | 'lastname'>;
