import { IsNotEmpty, IsUUID } from 'class-validator';

export class WhiteboardNodePropertyUpdateDTO {
  @IsUUID()
  @IsNotEmpty()
  nodeId!: string;
}
