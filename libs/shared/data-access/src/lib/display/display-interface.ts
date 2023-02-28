import { IUser } from '../user';
import { SafeUrl } from '@angular/platform-browser';

export interface IFileHandle {
  file: File;
  url: SafeUrl;
}

export interface IDisplay {
  id: string;
  title: string;
  fileName: string;
  pageCount?: number;
  currentIndex?: number;
  pages?: string[];
  currentLink?: string;
  expires?: Date;
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
  file: IFileHandle;
  author: string;
  editors: IUser[];
  lastUpdatedBy: string;
  lastUpdated: string;
  created: string;
}
