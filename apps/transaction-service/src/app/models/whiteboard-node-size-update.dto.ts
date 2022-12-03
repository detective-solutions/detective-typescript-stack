import { IsNotEmpty, IsNumber } from 'class-validator';

export class WhiteboardNodeSizeUpdateDTO {
  @IsNumber()
  @IsNotEmpty()
  width!: number;

  @IsNumber()
  @IsNotEmpty()
  height: number;
}
