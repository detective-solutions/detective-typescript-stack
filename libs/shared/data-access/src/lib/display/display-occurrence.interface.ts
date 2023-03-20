import { IDisplay } from './display.interface';

export interface IDisplayOccurrence {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
  author: string;
  editors: { id: string }[];
  lastUpdatedBy: string;
  lastUpdated: string;
  created: string;
  currentPageIndex?: number;
  filePageUrls?: string[];
  pageCount?: number;
  expires?: string;
  entity?: Partial<IDisplay>;
}
