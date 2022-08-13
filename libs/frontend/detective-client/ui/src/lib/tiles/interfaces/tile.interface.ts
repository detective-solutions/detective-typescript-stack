export interface ITilesInput {
  tiles: ITile[];
  totalElementsCount: number;
}

export interface ITile {
  id: string;
  title: string;
  targetUrl: string;
  description?: string;
  thumbnail?: string;
}
