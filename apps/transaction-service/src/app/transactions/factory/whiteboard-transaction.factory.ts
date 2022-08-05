import { IMessage, MessageEventType } from '@detective.solutions/shared/data-access';

import { LoadWhiteboardDataTransaction } from '../load-whiteboard-data.transaction';

/* eslint-disable @typescript-eslint/no-explicit-any */

const transactionMap: any = {};
Object.values(MessageEventType).forEach((eventType: string) => {
  if (eventType === MessageEventType.LoadWhiteboardData) {
    transactionMap[eventType] = LoadWhiteboardDataTransaction;
  }
});

console.log(transactionMap); // TODO: Remove me!

type TransactionMap = typeof transactionMap;
type Keys = keyof TransactionMap;
type Tuples<T> = T extends Keys ? [T, InstanceType<TransactionMap[T]>] : never;
type SingleKeys<K> = [K] extends (K extends Keys ? [K] : never) ? K : never;
type ClassType<A extends Keys> = Extract<Tuples<Keys>, [A, any]>[1];

export class WhiteboardTransactionFactory {
  static createTransaction<K extends Keys>(k: SingleKeys<K>, messagePayload: IMessage<any>): ClassType<K> {
    return new transactionMap[k](messagePayload);
  }
}
