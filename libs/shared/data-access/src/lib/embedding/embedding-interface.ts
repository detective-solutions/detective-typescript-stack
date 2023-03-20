export interface IEmbedding {
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
}
