export interface ProductInfo {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string };
  nickname: string;
  metadata: { description: string; user_limit: string };
}

export interface IGetAllProductResponse {
  prices: ProductInfo[];
}
