import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

import { IUserGroup } from '@detective.solutions/shared/data-access';

export class UserGroupDTO implements IUserGroup {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  name!: string;
}
