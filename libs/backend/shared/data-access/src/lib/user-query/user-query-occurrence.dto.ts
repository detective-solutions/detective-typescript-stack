import { IUser, IUserQuery, IUserQueryOccurrence } from '@detective.solutions/shared/data-access';
import { IsBoolean, IsNotEmpty, IsNumber, IsString, IsUUID, MaxLength } from 'class-validator';

export class UserQueryOccurrenceDTO implements IUserQueryOccurrence {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @MaxLength(254)
  @IsString()
  @IsNotEmpty()
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

  @IsNotEmpty()
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

  @IsNotEmpty()
  entity!: IUserQuery;
}
