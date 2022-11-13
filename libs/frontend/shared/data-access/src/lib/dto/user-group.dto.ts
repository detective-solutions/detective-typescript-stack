import { IUserGroup } from '@detective.solutions/shared/data-access';

export class UserGroupDTO implements IUserGroup {
  constructor(
    public xid = '',
    public name = '',
    public description = '',
    public memberCount = {
      count: 0,
    },
    public memebers = [
      {
        xid: '',
        firstname: '',
        lastname: '',
      },
    ],
    public lastUpdated = '',
    public tenant = { xid: '' }
  ) {}

  static Build(userGroupInput: IUserGroup) {
    if (!userGroupInput) {
      return new UserGroupDTO();
    }
    return new UserGroupDTO(
      userGroupInput.xid,
      userGroupInput.name,
      userGroupInput.description,
      userGroupInput.memberCount,
      userGroupInput.members,
      userGroupInput.lastUpdated,
      userGroupInput.tenant
    );
  }
}
