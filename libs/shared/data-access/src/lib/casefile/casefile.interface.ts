import { IUser } from '../user/user.interface';

export interface ICasefile {
  xid: string;
  title: string;
  description?: string;
  thumbnailSrc?: string;
  author?: IUser;
  views?: number;
  editors?: IUser[];
  lastUpdated?: Date | null | string;
}
