import { CasefileDTO } from '@detective.solutions/backend/shared/data-access';
import { ICasefileForWhiteboard } from '@detective.solutions/shared/data-access';
import { OmitType } from '@nestjs/mapped-types';

export class CasefileForWhiteboardDTO
  extends OmitType(CasefileDTO, [
    'thumbnail',
    'views',
    'author',
    'editors',
    'lastUpdatedBy',
    'lastUpdated',
    'created',
  ] as const)
  implements ICasefileForWhiteboard {}
