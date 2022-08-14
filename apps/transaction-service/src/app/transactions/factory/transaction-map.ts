import { LoadWhiteboardDataTransaction } from '../load-whiteboard-data.transaction';
import { MessageEventType } from '@detective.solutions/shared/data-access';
import { WhiteboardNodeAddedTransaction } from '../whiteboard-node-added.transaction';

/* eslint-disable @typescript-eslint/no-explicit-any */

const tempTransactionMap: any = {};
Object.values(MessageEventType).forEach((eventType: string) => {
  if (eventType === MessageEventType.LoadWhiteboardData) {
    tempTransactionMap[eventType] = LoadWhiteboardDataTransaction;
  }
  if (eventType === MessageEventType.WhiteboardNodeAdded) {
    tempTransactionMap[eventType] = WhiteboardNodeAddedTransaction;
  }
});

export const transactionMap = Object.assign({}, tempTransactionMap);
export type TransactionMap = typeof transactionMap;
export type TransactionKeys = keyof TransactionMap;
export type SingleTransactionKey<K> = [K] extends (K extends TransactionKeys ? [K] : any) ? K : any;
