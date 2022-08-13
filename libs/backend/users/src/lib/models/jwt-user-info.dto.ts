import { IntersectionType, PickType } from '@nestjs/mapped-types';

import { FlattenedTenantId } from './flattened-tenant.dto';
import { User } from '@detective.solutions/backend/shared/data-access';

export class JwtUserInfo extends IntersectionType(
  PickType(User, ['id', 'role', 'refreshTokenId'] as const),
  FlattenedTenantId
) {}
