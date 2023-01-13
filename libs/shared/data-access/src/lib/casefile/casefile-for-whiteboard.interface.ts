import { ICasefile } from './casefile.interface';

export type ICasefileForWhiteboard = Pick<
  ICasefile,
  'xid' | 'title' | 'description' | 'tables' | 'queries' | 'embeddings'
>;
