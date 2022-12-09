import {
  WhiteboardNodeAddedTransaction,
  WhiteboardNodeDeletedTransaction,
  WhiteboardNodePropertiesUpdatedTransaction,
  WhiteboardSaveTransaction,
  WhiteboardTitleFocusedTransaction,
  WhiteboardTitleUpdatedTransaction,
  WhiteboardUserJoinedTransaction,
  WhiteboardUserLeftTransaction,
} from '../../transaction';

import { MessageEventType } from '@detective.solutions/shared/data-access';

/* eslint-disable @typescript-eslint/no-explicit-any */

const tempTransactionMap: any = {};
Object.values(MessageEventType).forEach((eventType: string) => {
  if (eventType === MessageEventType.WhiteboardUserJoined) {
    tempTransactionMap[eventType] = WhiteboardUserJoinedTransaction;
  }
  if (eventType === MessageEventType.WhiteboardUserLeft) {
    tempTransactionMap[eventType] = WhiteboardUserLeftTransaction;
  }
  if (eventType === MessageEventType.WhiteboardNodeAdded) {
    tempTransactionMap[eventType] = WhiteboardNodeAddedTransaction;
  }
  if (eventType === MessageEventType.WhiteboardNodeDeleted) {
    tempTransactionMap[eventType] = WhiteboardNodeDeletedTransaction;
  }
  if (eventType === MessageEventType.WhiteboardNodePropertiesUpdated) {
    tempTransactionMap[eventType] = WhiteboardNodePropertiesUpdatedTransaction;
  }
  if (eventType === MessageEventType.WhiteboardTitleFocused) {
    tempTransactionMap[eventType] = WhiteboardTitleFocusedTransaction;
  }
  if (eventType === MessageEventType.WhiteboardTitleUpdated) {
    tempTransactionMap[eventType] = WhiteboardTitleUpdatedTransaction;
  }
  if (eventType === MessageEventType.SaveWhiteboard) {
    tempTransactionMap[eventType] = WhiteboardSaveTransaction;
  }
});

export const transactionMap = Object.assign({}, tempTransactionMap);
export type TransactionMap = typeof transactionMap;
export type TransactionKeys = keyof TransactionMap;
export type SingleTransactionKey<K> = [K] extends (K extends TransactionKeys ? [K] : any) ? K : any;
