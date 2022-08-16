import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { IUserGroup } from '@detective.solutions/shared/data-access';

export class UserGroupDTO implements IUserGroup {
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  name!: string;
}
