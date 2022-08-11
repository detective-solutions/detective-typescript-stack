import { IEmbedding, IUser } from '@detective.solutions/shared/data-access';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';

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

  @IsDate()
  @IsNotEmpty()
  lastUpdatedBy!: IUser;

  @IsDate()
  @IsNotEmpty()
  lastUpdated!: Date;

  @IsDate()
  @IsNotEmpty()
  created!: Date;
}
