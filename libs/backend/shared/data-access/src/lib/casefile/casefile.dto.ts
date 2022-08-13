import { ICasefile, IEmbedding, ITableOccurrence, IUser } from '@detective.solutions/shared/data-access';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';

import { Embedding } from '../embedding';
import { TableOccurrence } from '../table';
import { Type } from 'class-transformer';
import { UserQueryOccurrence } from '../user-query';

export class Casefile implements ICasefile {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @MaxLength(254)
  @IsString()
  @IsNotEmpty()
  title!: string;

  @MaxLength(254)
  @IsString()
  @IsOptional()
  description!: string;

  @MaxLength(254)
  @IsString()
  @IsOptional()
  thumbnail!: string;

  @ValidateNested({ each: true })
  @Type(() => TableOccurrence)
  @IsOptional()
  tables!: ITableOccurrence[];

  @ValidateNested({ each: true })
  @Type(() => UserQueryOccurrence)
  @IsOptional()
  queries!: any;

  @ValidateNested({ each: true })
  @Type(() => Embedding)
  @IsOptional()
  embeddings!: IEmbedding[];

  @IsNumber()
  @IsNotEmpty()
  views!: number;

  @IsNotEmpty()
  author!: IUser;

  @IsNotEmpty()
  editors!: IUser[];

  @IsNotEmpty()
  lastUpdatedBy!: IUser;

  @IsString()
  @IsNotEmpty()
  lastUpdated!: string;

  @IsString()
  @IsNotEmpty()
  created!: string;
}
