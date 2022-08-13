import { IUser, IUserQueryOccurrence } from '@detective.solutions/shared/data-access';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { User } from '../user';

export class UserQueryOccurrence implements IUserQueryOccurrence {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @MaxLength(254)
  @IsString()
  @IsNotEmpty()
  title!: string;

  @MaxLength(254)
  @IsString()
  @IsOptional()
  utterance!: string;

  @IsNumber()
  @IsNotEmpty()
  x!: number;

  @IsNumber()
  @IsNotEmpty()
  y!: number;

  @IsNumber()
  @IsNotEmpty()
  width!: number;

  @IsNumber()
  @IsNotEmpty()
  height!: number;

  @IsBoolean()
  @IsNotEmpty()
  locked!: boolean;

  @IsNotEmpty()
  author!: IUser;

  @IsNotEmpty()
  editors!: IUser[];

  @ValidateNested({ each: true })
  @Type(() => User)
  @IsNotEmpty()
  lastUpdatedBy!: IUser;

  @IsString()
  @IsNotEmpty()
  lastUpdated!: string;

  @IsString()
  @IsNotEmpty()
  created!: string;
}
