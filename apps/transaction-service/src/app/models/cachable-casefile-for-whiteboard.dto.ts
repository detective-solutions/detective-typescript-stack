import { AnyWhiteboardNode, ICachableCasefileForWhiteboard, IUser } from '@detective.solutions/shared/data-access';

import { CasefileDTO } from '@detective.solutions/backend/shared/data-access';
import { IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';

export class CachableCasefileForWhiteboardDTO
  extends PickType(CasefileDTO, ['id', 'title', 'description'] as const)
  implements ICachableCasefileForWhiteboard
{
  @IsNotEmpty()
  nodes!: AnyWhiteboardNode[];

  @IsNotEmpty()
  temporary: { activeUsers: IUser[] };
}
