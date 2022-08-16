import { ITableWhiteboardNode, WhiteboardNodeType } from '@detective.solutions/shared/data-access';
import { IsNotEmpty, IsString } from 'class-validator';

import { TableOccurrenceInputDTO } from './table-occurrence-input.dto';

export class TableWhiteboardNodeInputDTO extends TableOccurrenceInputDTO implements ITableWhiteboardNode {
  @IsString()
  @IsNotEmpty()
  type!: WhiteboardNodeType;
}
