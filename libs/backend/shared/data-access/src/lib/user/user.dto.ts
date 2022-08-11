import { IUser, UserRole } from '@detective.solutions/shared/data-access';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { Tenant } from '../tenant';
import { Type } from 'class-transformer';
import { UserGroup } from '../user-group';

export class User implements IUser {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @MaxLength(254)
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @MinLength(8)
  @MaxLength(64)
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ValidateNested({ each: true })
  @Type(() => Tenant)
  @IsNotEmpty()
  tenantIds!: Tenant[];

  @IsNotEmpty()
  role!: UserRole;

  @MaxLength(64)
  @IsString()
  firstname!: string;

  @MaxLength(64)
  @IsString()
  lastname!: string;

  @MaxLength(64)
  @IsString()
  title!: string;

  @IsUrl()
  avatarUrl!: string;

  @ValidateNested({ each: true })
  @Type(() => UserGroup)
  userGroups!: UserGroup[];

  @ValidateIf((refreshTokenId) => refreshTokenId !== '')
  @IsString()
  @IsOptional()
  refreshTokenId!: string;
}
