import { PickType } from '@nestjs/mapped-types';
import { User } from '@detective.solutions/backend/shared/data-access';

export class UserForCasefile extends PickType(User, ['id', 'role'] as const) {}
