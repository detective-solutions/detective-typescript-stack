import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { ITenant } from '@detective.solutions/shared/data-access';

export class Tenant implements ITenant {
  @IsNotEmpty()
  @IsUUID()
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
