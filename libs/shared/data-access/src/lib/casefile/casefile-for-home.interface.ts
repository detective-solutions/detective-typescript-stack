import { ICasefile } from './casefile.interface';

export type ICasefileForHome = Pick<
  ICasefile,
  | 'tables'
  | 'xid'
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
