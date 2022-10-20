import { IMessage } from '@detective.solutions/shared/data-access';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IPropagationMessage extends IMessage<any> {
  propagationClientId: string;
}
