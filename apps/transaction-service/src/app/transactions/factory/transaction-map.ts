import { MessageEventType } from '@detective.solutions/shared/data-access';
import { WhiteboardNodeAddedTransaction } from '../whiteboard-node-added.transaction';
import { WhiteboardNodeBlockedTransaction } from '../whiteboard-node-blocked.transaction';
import { WhiteboardNodeDeletedTransaction } from '../whiteboard-node-deleted.transaction';
import { WhiteboardNodeMovedTransaction } from '../whiteboard-node-moved.transaction';
import { WhiteboardSaveTransaction } from '../whiteboard-save.transaction';
import { WhiteboardTitleFocusedTransaction } from '../whiteboard-title-focused.transaction';
import { WhiteboardTitleUpdatedTransaction } from '../whiteboard-title-updated.transaction';
import { WhiteboardUserJoinedTransaction } from '../whiteboard-user-joined.transaction';
import { WhiteboardUserLeftTransaction } from '../whiteboard-user-left.transaction';

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
  if (eventType === MessageEventType.WhiteboardNodeBlocked) {
    tempTransactionMap[eventType] = WhiteboardNodeBlockedTransaction;
  }
  if (eventType === MessageEventType.WhiteboardNodeMoved) {
    tempTransactionMap[eventType] = WhiteboardNodeMovedTransaction;
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
