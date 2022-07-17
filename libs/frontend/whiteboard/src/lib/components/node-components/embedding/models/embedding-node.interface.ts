import { INode } from '../../../../models';

/* eslint-disable @typescript-eslint/no-empty-interface */

export interface IEmbeddingNode extends INode {
  href: string;
  temporary?: IEmbeddingNodeTemporaryData;
}

export interface IEmbeddingNodeTemporaryData {}
