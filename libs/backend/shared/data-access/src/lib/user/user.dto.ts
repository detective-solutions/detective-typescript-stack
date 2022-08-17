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

import { TenantDTO } from '../tenant';
import { Type } from 'class-transformer';
import { UserGroupDTO } from '../user-group';

export class UserDTO implements IUser {
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
  @Type(() => TenantDTO)
  @IsNotEmpty()
  tenantIds!: TenantDTO[];

  @IsNotEmpty()
  role!: UserRole;

  @MaxLength(64)
  @IsString()
  @IsOptional()
  firstname!: string;

  @MaxLength(64)
  @IsString()
  @IsOptional()
  lastname!: string;

  @MaxLength(64)
  @IsString()
  @IsOptional()
  title!: string;

  @IsUrl()
  @IsOptional()
  avatarUrl!: string;

  @ValidateNested({ each: true })
  @Type(() => UserGroupDTO)
  @IsOptional()
  userGroups!: UserGroupDTO[];

  @ValidateIf((refreshTokenId) => refreshTokenId !== '')
  @IsString()
  @IsOptional()
  refreshTokenId!: string;
}
