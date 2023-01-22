import { ICasefile } from './casefile.interface';

export type ICasefileForHome = Pick<
  ICasefile,
  | 'tables'
  | 'id'
  | 'title'
  | 'description'
  | 'thumbnail'
  | 'views'
  | 'author'
  | 'editors'
  | 'lastUpdatedBy'
  | 'lastUpdated'
  | 'created'
>;
