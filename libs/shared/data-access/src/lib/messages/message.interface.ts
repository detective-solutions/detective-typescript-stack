import { IMessageContext } from './message-context.interface';

export interface IMessage<T> {
  context: IMessageContext;
  body: T;
}
