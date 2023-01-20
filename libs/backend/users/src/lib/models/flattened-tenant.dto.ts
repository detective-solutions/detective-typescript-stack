import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { TenantStatus } from '@detective.solutions/shared/data-access';

// This DTO is used to build flattened intersection types
export class FlattenedTenantId {
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsEnum(TenantStatus)
  tenantStatus: TenantStatus;
}
