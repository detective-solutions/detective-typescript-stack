export type WebsocketMessage<T> = {
  access_token: string;
  event: string;
  data: T;
};
