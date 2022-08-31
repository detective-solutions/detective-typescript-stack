import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';

import { IWhiteboardNodeBlockUpdate } from '@detective.solutions/shared/data-access';

export class WhiteboardNodeBlockUpdateDTO implements IWhiteboardNodeBlockUpdate {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @IsObject()
  @IsNotEmpty()
  temporary: { blockedBy: string | null };
}
