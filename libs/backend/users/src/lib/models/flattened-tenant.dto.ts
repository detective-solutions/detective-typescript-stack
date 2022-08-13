import { IsNotEmpty, IsString } from 'class-validator';

// This DTO is used to build flattened intersection types
export class FlattenedTenantId {
  @IsNotEmpty()
  @IsString()
  tenantId: string;
}
