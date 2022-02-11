import { IUser, UserRole } from '@detective.solutions/shared/data-access';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';

import { UserGroup } from './user-group.dto';

export class User implements IUser {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;

  @IsNotEmpty()
  @IsUUID()
  tenantId: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role?: UserRole;

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

export class UserWithoutPassword extends OmitType(User, ['password'] as const) {}

export class UserUpdate extends PartialType(User) {}
