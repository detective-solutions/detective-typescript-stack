import { ICasefile, IUser } from '@detective.solutions/shared/data-access';

import { User } from './user.dto';

export class Casefile implements ICasefile {
  static readonly casefileImagePlaceholder = 'assets/images/detective-logo.svg';

  constructor(
    public id = '',
    public title = '',
    public description = '',
    public thumbnailSrc = '',
    public author = new User(),
    public views = 0,
    public editors = [{ email: '' }] as IUser[],
    public lastUpdated: Date | null = null
  ) {}

  static Build(casefile: Casefile) {
    if (!casefile) {
      return new Casefile();
    }

    return new Casefile(
      casefile.id,
      casefile.title,
      casefile.description ?? '',
      casefile.thumbnailSrc ?? Casefile.casefileImagePlaceholder,
      User.Build(casefile.author as IUser),
      casefile.views,
      casefile.editors as IUser[],
      casefile.lastUpdated as Date
    );
  }

  toJSON(): object {
    const serialized = Object.assign(this);
    delete serialized.id;
    return serialized;
  }
}
