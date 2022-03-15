export interface ITilesInput {
  tiles: ITile[];
  totalElementsCount: number;
}

export interface ITile {
  id: string;
  title: string;
  description?: string;
  imageSrc?: string;
}
