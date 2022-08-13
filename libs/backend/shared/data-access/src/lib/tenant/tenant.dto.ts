import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { ITenant } from '@detective.solutions/shared/data-access';

export class Tenant implements ITenant {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @MaxLength(64)
  @IsString()
  @IsOptional()
  name!: string;
}
