export interface IDisplay {
  id: string;
  fileName: string;
  sourceType: string;
  pageCount: number;
  author: string;
  editors: { id: string }[];
  lastUpdatedBy: string;
  lastUpdated: string;
  created: string;
}
