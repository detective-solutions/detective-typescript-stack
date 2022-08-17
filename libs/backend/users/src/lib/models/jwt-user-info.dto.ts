import { IntersectionType, PickType } from '@nestjs/mapped-types';

import { FlattenedTenantId } from './flattened-tenant.dto';
import { UserDTO } from '@detective.solutions/backend/shared/data-access';

export class JwtUserInfo extends IntersectionType(
  PickType(UserDTO, ['id', 'role', 'refreshTokenId'] as const),
  FlattenedTenantId
) {}
