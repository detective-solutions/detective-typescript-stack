import { IsEmail, IsNotEmpty, IsString, IsUrl, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { PartialType, PickType } from '@nestjs/mapped-types';

import { IUser } from '@detective.solutions/shared/data-access';
import { UserGroup } from './user-group.dto';

export class User implements IUser {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;

  @IsString()
  @MaxLength(64)
  firstname: string;

  @IsString()
  @MaxLength(64)
  lastname: string;

  @IsString()
  @MaxLength(64)
  title: string;

  @IsUrl()
  avatarUrl: string;

  @ValidateNested()
  userGroups: UserGroup[] = [];
}

export class UserLogin extends PickType(User, ['email', 'password'] as const) {}

export class UserUpdate extends PartialType(User) {}
