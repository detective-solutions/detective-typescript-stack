import { ICasefile } from './casefile.interface';

export type ICasefileForWhiteboard = Omit<
  ICasefile,
  'thumbnail' | 'views' | 'author' | 'editors' | 'lastUpdatedBy' | 'lastUpdated' | 'created'
>;
