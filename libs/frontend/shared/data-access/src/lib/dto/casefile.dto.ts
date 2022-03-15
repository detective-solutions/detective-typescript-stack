import { IUser } from '@detective.solutions/shared/data-access';
import { User } from './user.dto';

export class Casefile implements Casefile {
  static readonly casefileImagePlaceholder = 'assets/images/mocks/casefile-thumbnail-mock.jpg';

  constructor(
    public id = '',
    public title = '',
    public description = '',
    public imageSrc = '',
    public author = new User(),
    public views = 0,
    public editors = [{ email: '' }] as IUser[],
    public lastUpdated: Date | null = null
  ) {}

  static Build(casefile: Casefile) {
    if (!casefile) {
      return new Casefile();
    }

    // TODO: Provide fallback image here
    // if (!casefile.imageSrc) {
    //   casefile.imageSrc = Casefile.casefileImagePlaceholder;
    // }

    return new Casefile(
      casefile.id,
      casefile.title,
      casefile.description,
      casefile.imageSrc,
      User.Build(casefile.author as IUser),
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
