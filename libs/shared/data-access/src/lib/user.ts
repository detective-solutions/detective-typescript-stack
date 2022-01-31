export interface IUser {
  email: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  title?: string;
  avatarUrl?: string;
  userGroups?: IUserGroup[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserGroup {}

export class User implements IUser {
  constructor(
    public email = '',
    public password = '',
    public firstname = '',
    public lastname = '',
    public title = '',
    public avatarUrl = '',
    public userGroups = [{}]
  ) {}

  static Build(user: IUser) {
    if (!user) {
      return new User();
    }

    return new User(
      user.email,
      user.password,
      user.firstname,
      user.lastname,
      user.title,
      user.avatarUrl,
      user.userGroups as IUserGroup[]
    );
  }

  public get fullName(): string {
    return this.firstname && this.lastname ? `${this.firstname} ${this.lastname}` : '';
  }

  toJSON(): object {
    const serialized = Object.assign(this);
    delete serialized.fullName;
    return serialized;
  }
}
