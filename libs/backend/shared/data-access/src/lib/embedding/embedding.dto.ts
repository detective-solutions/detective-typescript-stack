import { IEmbedding, IUser } from '@detective.solutions/shared/data-access';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { UserForWhiteboard } from '../user';

export class Embedding implements IEmbedding {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @MaxLength(254)
  @IsString()
  @IsOptional()
  title!: string;

  @IsUrl()
  @IsString()
  @IsNotEmpty()
  href!: string;

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
  @Type(() => UserForWhiteboard)
  @IsNotEmpty()
  lastUpdatedBy!: IUser;

  @IsString()
  @IsNotEmpty()
  lastUpdated!: string;

  @IsString()
  @IsNotEmpty()
  created!: string;
}
