import { PickType } from '@nestjs/mapped-types';
import { User } from './user.dto';

export class UserForWhiteboard extends PickType(User, [
  'id',
  'firstname',
  'lastname',
  'title',
  'role',
  'avatarUrl',
] as const) {}
