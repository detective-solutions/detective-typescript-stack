import { IncomingMessage } from 'http';

export type WebSocketInfo = {
  origin: string;
  secure: boolean;
  req: IncomingMessage;
};
