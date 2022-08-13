import { Casefile } from '@detective.solutions/backend/shared/data-access';
import { ICasefileForWhiteboard } from '@detective.solutions/shared/data-access';
import { OmitType } from '@nestjs/mapped-types';

export class CasefileForWhiteboard
  extends OmitType(Casefile, [
    'thumbnail',
    'views',
    'author',
    'editors',
    'lastUpdatedBy',
    'lastUpdated',
    'created',
  ] as const)
  implements ICasefileForWhiteboard {}
