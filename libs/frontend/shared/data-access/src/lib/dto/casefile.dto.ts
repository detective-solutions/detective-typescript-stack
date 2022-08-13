import {
  ICasefile,
  IEmbedding,
  ITableOccurrence,
  IUser,
  IUserQueryOccurrence,
} from '@detective.solutions/shared/data-access';

import { User } from './user.dto';

export class Casefile implements ICasefile {
  static readonly thumbnailPlaceholder = 'assets/images/detective-logo.svg';

  constructor(
    public id: string,
    public title: string,
    public description: string,
    public thumbnail: string,
    public views: number,
    public author: User,
    public editors: IUser[],
    public lastUpdatedBy: IUser,
    public lastUpdated: string,
    public created: string,
    public tables: ITableOccurrence[],
    public queries: IUserQueryOccurrence[],
    public embeddings: IEmbedding[]
  ) {}

  static Build(casefileInput: ICasefile) {
    return new Casefile(
      casefileInput.id,
      casefileInput.title,
      casefileInput.description ?? '',
      casefileInput.thumbnail ?? Casefile.thumbnailPlaceholder,
      casefileInput.views,
      User.Build(casefileInput.author as IUser),
      casefileInput.editors as IUser[],
      casefileInput.lastUpdatedBy,
      casefileInput.lastUpdated,
      casefileInput.created,
      casefileInput.tables,
      casefileInput.queries,
      casefileInput.embeddings
    );
  }
}
