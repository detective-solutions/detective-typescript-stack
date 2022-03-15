import { IUser } from '../user/user.interface';

export interface ICasefile {
  id: string;
  title: string;
  description?: string;
  imageSrc?: string;
  author?: IUser;
  views?: number;
  editors?: IUser[];
  lastUpdated?: Date | null | string;
}
