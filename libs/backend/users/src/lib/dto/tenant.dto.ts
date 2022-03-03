import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { ITenant } from '@detective.solutions/shared/data-access';

export class Tenant implements ITenant {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  name: string;
}

// This DTO is used to build flattened intersection types
export class FlattenedTenantId {
  @IsNotEmpty()
  @IsString()
  tenantId: string;
}
