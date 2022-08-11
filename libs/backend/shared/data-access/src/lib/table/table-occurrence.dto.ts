import { ITableOccurrence, IUser } from '@detective.solutions/shared/data-access';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class TableOccurrence implements ITableOccurrence {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @MaxLength(254)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @MaxLength(254)
  @IsString()
  @IsOptional()
  title!: string;

  @MaxLength(254)
  @IsString()
  @IsOptional()
  description!: string;

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
