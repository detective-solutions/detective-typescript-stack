import { IDisplay } from './display.interface';
import { IUser } from '../user';

export interface IDisplayOccurrence {
  id: string;
  title: string;
  fileName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
  author: string;
  editors: IUser[];
  lastUpdatedBy: string;
  lastUpdated: string;
  created: string;
  currentFilePageUrl?: string;
  currentPageIndex?: number;
  filePageUrls?: string[];
  pageCount?: number;
  expires?: Date;
  entity?: Partial<IDisplay>;
}
