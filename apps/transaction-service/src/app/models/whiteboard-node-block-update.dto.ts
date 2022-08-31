import { IsNotEmpty, IsObject } from 'class-validator';

import { IWhiteboardNodeBlockUpdate } from '@detective.solutions/shared/data-access';

export class WhiteboardNodeBlockUpdateDTO implements IWhiteboardNodeBlockUpdate {
  @IsObject()
  @IsNotEmpty()
  temporary: { blockedBy: string | null };
}
