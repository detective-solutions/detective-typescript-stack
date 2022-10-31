import { ICasefile } from './casefile.interface';

export type ICasefileForWhiteboard = Pick<
  ICasefile,
  'id' | 'title' | 'description' | 'tables' | 'queries' | 'embeddings'
>;
