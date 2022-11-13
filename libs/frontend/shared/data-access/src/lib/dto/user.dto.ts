import { ITenant, IUser, IUserGroup, UserRole } from '@detective.solutions/shared/data-access';

export class UserDTO implements IUser {
  constructor(
    public id = '',
    public email = '',
    public tenantIds: ITenant[] = [],
    public role = UserRole.BASIC,
    public firstname = '',
    public lastname = '',
    public title = '',
    public avatarUrl = '',
    public userGroups: IUserGroup[] = [],
    public lastUpdated = ''
  ) {}

  static Build(userInput: IUser) {
    if (!userInput) {
      return new UserDTO();
    }
    return new UserDTO(
      userInput.id,
      userInput.email,
      userInput.tenantIds as ITenant[],
      userInput.role,
      userInput.firstname,
      userInput.lastname,
      userInput.title,
      userInput.avatarUrl,
      userInput.userGroups as IUserGroup[],
      userInput.lastUpdated
    );
  }

  public get fullName(): string {
    return this.firstname && this.lastname ? `${this.firstname} ${this.lastname}` : '';
  }
}
