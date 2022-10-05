import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

import { IWhiteboardNodePositionUpdate } from '@detective.solutions/shared/data-access';

export class WhiteboardNodePositionUpdateDTO implements IWhiteboardNodePositionUpdate {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @IsNumber()
  @IsNotEmpty()
  x!: number;

  @IsNumber()
  @IsNotEmpty()
  y!: number;
}
