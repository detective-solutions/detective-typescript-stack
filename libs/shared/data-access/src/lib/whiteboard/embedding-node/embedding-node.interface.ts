import { IEmbedding } from '../../embedding';

/* eslint-disable @typescript-eslint/no-empty-interface */

export interface IEmbeddingNode extends IEmbedding {
  temporary?: IEmbeddingNodeTemporaryData;
}

export interface IEmbeddingNodeTemporaryData {}
