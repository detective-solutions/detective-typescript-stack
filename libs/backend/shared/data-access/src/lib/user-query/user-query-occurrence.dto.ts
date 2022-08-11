import { IUser, IUserQueryOccurrence } from '@detective.solutions/shared/data-access';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UserQueryOccurrence implements IUserQueryOccurrence {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @MaxLength(254)
  @IsString()
  @IsNotEmpty()
  title!: string;

  @MaxLength(254)
  @IsString()
  @IsOptional()
  utterance!: string;

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
