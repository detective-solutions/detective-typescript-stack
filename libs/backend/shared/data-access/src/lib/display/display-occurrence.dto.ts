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
  @IsOptional()
  author!: string;

  @IsArray()
  @IsOptional()
  editors!: IUser[];

  @IsUUID()
  @IsOptional()
  lastUpdatedBy!: string;

  @IsDateString()
  @IsOptional()
  lastUpdated!: string;

  @IsDateString()
  @IsOptional()
  created!: string;

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
  entity!: Partial<IDisplay>;
}
