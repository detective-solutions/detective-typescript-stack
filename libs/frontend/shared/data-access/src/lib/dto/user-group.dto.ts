import { IUserGroup } from '@detective.solutions/shared/data-access';

export class UserGroupDTO implements IUserGroup {
  constructor(
    public xid = '',
    public name = '',
    public description = '',
    public members = {
      count: 0,
    },
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
      userGroupInput.members,
      userGroupInput.lastUpdated,
      userGroupInput.tenant
    );
  }
}
