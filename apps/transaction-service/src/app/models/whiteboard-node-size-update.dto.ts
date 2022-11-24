import { IsNotEmpty, IsNumber } from 'class-validator';

import { IWhiteboardNodeSizeUpdate } from '@detective.solutions/shared/data-access';

export class WhiteboardNodeSizeUpdateDTO implements IWhiteboardNodeSizeUpdate {
  @IsNumber()
  @IsNotEmpty()
  width!: number;

  @IsNumber()
  @IsNotEmpty()
  height: number;
}
