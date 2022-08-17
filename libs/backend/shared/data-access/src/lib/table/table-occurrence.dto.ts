import { ITable, ITableOccurrence, IUser } from '@detective.solutions/shared/data-access';
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
import { UserForWhiteboardDTO } from '../user';

export class TableOccurrenceDTO implements ITableOccurrence {
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

  @ValidateNested({ each: true })
  @Type(() => UserForWhiteboardDTO)
  @IsNotEmpty()
  lastUpdatedBy!: IUser;

  @IsString()
  @IsNotEmpty()
  lastUpdated!: string;

  @IsString()
  @IsNotEmpty()
  created!: string;

  @IsNotEmpty()
  entity!: ITable;
}
