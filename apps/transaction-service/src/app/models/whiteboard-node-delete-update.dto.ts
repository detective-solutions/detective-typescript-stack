import { IsNotEmpty, IsUUID } from 'class-validator';

import { IWhiteboardNodeDeleteUpdate } from '@detective.solutions/shared/data-access';

export class WhiteboardNodeDeleteUpdateDTO implements IWhiteboardNodeDeleteUpdate {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
