import { IEmbedding } from '../../embedding';
import { IGeneralWhiteboardNodeTemporaryData } from '..';

/* eslint-disable @typescript-eslint/no-empty-interface */

export interface IEmbeddingNode extends IEmbedding {
  temporary?: IEmbeddingNodeTemporaryData;
}

export interface IEmbeddingNodeTemporaryData extends IGeneralWhiteboardNodeTemporaryData {}
