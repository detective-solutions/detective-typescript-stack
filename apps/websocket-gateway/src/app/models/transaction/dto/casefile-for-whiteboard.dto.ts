import { AnyWhiteboardNode, ICasefileForWhiteboard } from '@detective.solutions/shared/data-access';

import { CasefileDTO } from '@detective.solutions/backend/shared/data-access';
import { PickType } from '@nestjs/mapped-types';

export class CasefileForWhiteboardDTO
  extends PickType(CasefileDTO, ['id', 'title', 'description', 'tables', 'queries', 'displays', 'embeddings'] as const)
  implements ICasefileForWhiteboard
{
  nodes: AnyWhiteboardNode[];
}
