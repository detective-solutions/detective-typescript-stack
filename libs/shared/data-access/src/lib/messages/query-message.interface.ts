export interface IQueryMessage {
  query: string;
  queryType: string;
  followEvent: IQueryMessage;
}
