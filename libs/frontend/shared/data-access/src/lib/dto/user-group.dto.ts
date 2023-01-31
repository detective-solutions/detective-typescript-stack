import { IUserGroup, UserGroupMember } from '@detective.solutions/shared/data-access';

import { UserDTO } from './user.dto';

export class UserGroupDTO implements IUserGroup {
  constructor(
    public id = '',
    public name = '',
    public description = '',
    public memberCount = { count: 0 },
    public members: UserGroupMember[] = [],
    public lastUpdated = ''
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
      userGroupInput.members?.map(UserDTO.Build) ?? [],
      userGroupInput.lastUpdated
    );
  }
}
