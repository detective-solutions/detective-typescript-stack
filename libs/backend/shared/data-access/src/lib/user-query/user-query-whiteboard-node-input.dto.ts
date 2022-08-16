import { IUserQueryWhiteboardNode, WhiteboardNodeType } from '@detective.solutions/shared/data-access';
import { IsNotEmpty, IsString } from 'class-validator';

import { UserQueryOccurrenceInputDTO } from './user-query-occurrence-input.dto';

export class UserQueryWhiteboardNodeInputDTO extends UserQueryOccurrenceInputDTO implements IUserQueryWhiteboardNode {
  @IsString()
  @IsNotEmpty()
  type!: WhiteboardNodeType;
}
