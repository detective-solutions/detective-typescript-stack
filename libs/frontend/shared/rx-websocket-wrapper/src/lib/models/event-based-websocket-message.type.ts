/* eslint-disable @typescript-eslint/no-explicit-any */

import { IMessage } from '@detective.solutions/shared/data-access';

export type EventBasedWebSocketMessage = {
  event: string;
  data: IMessage<any>;
};
