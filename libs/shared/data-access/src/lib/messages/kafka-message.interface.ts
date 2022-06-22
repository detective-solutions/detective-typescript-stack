import { IMessage } from './message.interface';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IKafkaMessage {
  timestamp: string;
  offset: string;
  key: string;
  value: IMessage<any>;
  headers: object;
  topic: string;
}
