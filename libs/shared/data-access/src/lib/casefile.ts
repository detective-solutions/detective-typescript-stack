import { IUser } from './user/user.interface';

export interface ICasefile {
  _id: string;
  title: string;
  description?: string;
  imageSrc?: string;
  author?: IUser;
  views?: number;
  editors?: IUser[];
  lastUpdated?: Date | null | string;
}

export class Casefile implements ICasefile {
  static readonly casefileImagePlaceholder = 'assets/images/mocks/casefile-thumbnail-mock.jpg';

  constructor(
    public _id = '',
    public title = '',
    public description = '',
    public imageSrc = '',
    public author = { email: '' } as IUser,
    public views = 0,
    public editors = [{ email: '' }] as IUser[],
    public lastUpdated: Date | null = null
  ) {}

  static Build(casefile: ICasefile) {
    if (!casefile) {
      return new Casefile();
    }

    if (!casefile.imageSrc) {
      casefile.imageSrc = Casefile.casefileImagePlaceholder;
    }

    return new Casefile(
      casefile._id,
      casefile.title,
      casefile.description,
      casefile.imageSrc,
      casefile.author as IUser,
      casefile.views,
      casefile.editors as IUser[],
      casefile.lastUpdated as Date
    );
  }

  toJSON(): object {
    const serialized = Object.assign(this);
    delete serialized._id;
    return serialized;
  }
}
