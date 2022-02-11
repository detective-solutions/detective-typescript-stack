import { IUser, IUserGroup, UserRole } from '@detective.solutions/shared/data-access';

export class User implements IUser {
  constructor(
    public id = '',
    public email = '',
    public tenantId = '',
    public role = UserRole.BASIC,
    public firstname = '',
    public lastname = '',
    public title = '',
    public avatarUrl = '',
    public userGroups: IUserGroup[] = []
  ) {}

  static Build(userInput: IUser) {
    if (!userInput) {
      return new User();
    }
    return new User(
      userInput.id,
      userInput.email,
      userInput.tenantId,
      UserRole.BASIC,
      userInput.firstname,
      userInput.lastname,
      userInput.title,
      userInput.avatarUrl,
      userInput.userGroups as IUserGroup[]
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
