import { IUserGroup } from '@detective.solutions/shared/data-access';

export class UserGroupDTO implements IUserGroup {
  constructor(
    public id = '',
    public name = '',
    public description = '',
    public memberCount = {
      count: 0,
    },
    public memebers = [
      {
        id: '',
        firstname: '',
        lastname: '',
      },
    ],
    public lastUpdated = '',
    public tenant = { id: '' }
  ) {}

  static Build(userGroupInput: IUserGroup) {
    if (!userGroupInput) {
      return new UserGroupDTO();
    }
    return new UserGroupDTO(
      userGroupInput.id,
      userGroupInput.name,
      userGroupInput.description,
      userGroupInput.memberCount,
      userGroupInput.members,
      userGroupInput.lastUpdated,
      userGroupInput.tenant
    );
  }
}
