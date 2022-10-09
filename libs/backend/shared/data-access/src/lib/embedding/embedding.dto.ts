import { IEmbedding, IUser } from '@detective.solutions/shared/data-access';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, IsUrl, MaxLength } from 'class-validator';

export class EmbeddingDTO implements IEmbedding {
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

  @IsUUID()
  @IsNotEmpty()
  author!: string;

  // TODO: Add validation
  editors!: IUser[];

  @IsUUID()
  @IsNotEmpty()
  lastUpdatedBy!: string;

  @IsString()
  @IsNotEmpty()
  lastUpdated!: string;

  @IsString()
  @IsNotEmpty()
  created!: string;
}
