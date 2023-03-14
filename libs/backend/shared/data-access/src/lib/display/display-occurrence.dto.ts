import { IDisplay, IDisplayOccurrence, IUser } from '@detective.solutions/shared/data-access';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class DisplayOccurrenceDTO implements IDisplayOccurrence {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @MaxLength(254)
  @IsString()
  @IsOptional()
  title!: string;

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

  @IsArray()
  @IsOptional()
  editors!: IUser[];

  @IsUUID()
  @IsOptional()
  lastUpdatedBy!: string;

  @IsDateString()
  @IsNotEmpty()
  lastUpdated!: string;

  @IsDateString()
  @IsNotEmpty()
  created!: string;

  @IsString()
  @IsOptional()
  currentFilePageUrl!: string;

  @IsNumber()
  @IsOptional()
  currentPageIndex!: number;

  @IsArray()
  @IsOptional()
  filePageUrls!: string[];

  @IsNumber()
  @IsOptional()
  pageCount!: number;

  @IsDateString()
  @IsOptional()
  expires!: string;

  @IsNotEmpty()
  entity!: IDisplay;
}
