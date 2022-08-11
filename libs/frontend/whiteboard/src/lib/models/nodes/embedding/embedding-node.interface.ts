import { IEmbedding } from '@detective.solutions/shared/data-access';

/* eslint-disable @typescript-eslint/no-empty-interface */

export interface IEmbeddingNode extends IEmbedding {
  temporary?: IEmbeddingNodeTemporaryData;
}

export interface IEmbeddingNodeTemporaryData {}
