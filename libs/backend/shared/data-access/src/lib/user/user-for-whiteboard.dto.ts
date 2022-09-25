import { IUserForWhiteboard } from '@detective.solutions/shared/data-access';
import { PickType } from '@nestjs/mapped-types';
import { UserDTO } from './user.dto';

export class UserForWhiteboardDTO
  extends PickType(UserDTO, ['id', 'firstname', 'lastname', 'title', 'role', 'avatarUrl'] as const)
  implements IUserForWhiteboard {}
