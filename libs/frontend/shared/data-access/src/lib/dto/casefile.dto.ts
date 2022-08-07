import { ICasefile, IUser } from '@detective.solutions/shared/data-access';

import { User } from './user.dto';

export class Casefile implements ICasefile {
  static readonly thumbnailPlaceholder = 'assets/images/detective-logo.svg';

  constructor(
    public id = '',
    public title = '',
    public description = '',
    public thumbnailSrc = '',
    public author = new User(),
    public views = 0,
    public editors = [{ email: '' }] as IUser[],
    public lastUpdated: Date | null = null,
    public tableObjects = [] as any[] // TODO: Add correct tableNode type here
  ) {}

  static Build(casefileInput: ICasefile) {
    if (!casefileInput) {
      return new Casefile();
    }

    return new Casefile(
      casefileInput.id,
      casefileInput.title,
      casefileInput.description ?? '',
      casefileInput.thumbnailSrc ?? Casefile.thumbnailPlaceholder,
      User.Build(casefileInput.author as IUser),
      casefileInput.views,
      casefileInput.editors as IUser[],
      casefileInput.lastUpdated as Date,
      casefileInput.tableObjects
    );
  }

  toJSON(): object {
    const serialized = Object.assign(this);
    delete serialized.id;
    return serialized;
  }
}
