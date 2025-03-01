import { ICasefile, IEmbedding, ITableOccurrence, IUser } from '@detective.solutions/shared/data-access';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';

import { DisplayOccurrenceDTO } from '../display';
import { EmbeddingDTO } from '../embedding';
import { TableOccurrenceDTO } from '../table';
import { Type } from 'class-transformer';
import { UserQueryOccurrenceDTO } from '../user-query';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class CasefileDTO implements ICasefile {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @MaxLength(254)
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description!: string;

  @MaxLength(254)
  @IsString()
  @IsOptional()
  thumbnail!: string;

  @ValidateNested({ each: true })
  @Type(() => TableOccurrenceDTO)
  @IsOptional()
  tables!: ITableOccurrence[];

  @ValidateNested({ each: true })
  @Type(() => UserQueryOccurrenceDTO)
  @IsOptional()
  queries!: any;

  @ValidateNested({ each: true })
  @Type(() => DisplayOccurrenceDTO)
  @IsOptional()
  displays!: any;

  @ValidateNested({ each: true })
  @Type(() => EmbeddingDTO)
  @IsOptional()
  embeddings!: IEmbedding[];

  @IsNumber()
  @IsNotEmpty()
  views!: number;

  @IsNotEmpty()
  author!: IUser;

  editors!: { id: string }[];

  @IsNotEmpty()
  lastUpdatedBy!: IUser;

  @IsString()
  @IsNotEmpty()
  lastUpdated!: string;

  @IsString()
  @IsNotEmpty()
  created!: string;
}
