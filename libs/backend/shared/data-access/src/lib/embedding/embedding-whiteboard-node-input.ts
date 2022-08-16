import { IEmbeddingWhiteboardNode, WhiteboardNodeType } from '@detective.solutions/shared/data-access';
import { IsNotEmpty, IsString } from 'class-validator';

import { EmbeddingInputDTO } from './embedding-input.dto';

export class EmbeddingWhiteboardNodeInputDTO extends EmbeddingInputDTO implements IEmbeddingWhiteboardNode {
  @IsString()
  @IsNotEmpty()
  type!: WhiteboardNodeType;
}
