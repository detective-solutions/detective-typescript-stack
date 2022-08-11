import { Casefile } from './casefile.dto';
import { ICasefileForWhiteboard } from '@detective.solutions/shared/data-access';
import { OmitType } from '@nestjs/mapped-types';

export class CasefileForWhiteboardDTO
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
