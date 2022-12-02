import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class WhiteboardNodePositionUpdateDTO {
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
