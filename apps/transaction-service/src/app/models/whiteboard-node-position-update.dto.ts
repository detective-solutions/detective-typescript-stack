import { IWhiteboardNodePositionUpdate, WhiteboardNodeType } from '@detective.solutions/shared/data-access';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  type!: WhiteboardNodeType;
}
