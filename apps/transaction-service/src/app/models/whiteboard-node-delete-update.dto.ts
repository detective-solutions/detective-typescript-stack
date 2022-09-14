import { IWhiteboardNodeDeleteUpdate, WhiteboardNodeType } from '@detective.solutions/shared/data-access';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class WhiteboardNodeDeleteUpdateDTO implements IWhiteboardNodeDeleteUpdate {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsEnum(WhiteboardNodeType)
  @IsNotEmpty()
  type: WhiteboardNodeType;
}
