export interface IGetSubscriptionPaymentResponse {
  id: string;
  cardType: string;
  number: string;
}

export interface IGetChangePaymentResponse {
  url: string;
}
