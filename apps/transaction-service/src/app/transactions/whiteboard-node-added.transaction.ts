import {
  AnyWhiteboardNode,
  IEmbeddingWhiteboardNode,
  IMessage,
  ITableWhiteboardNode,
  IUserQueryWhiteboardNode,
  KafkaTopic,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';
import {
  EmbeddingWhiteboardNodeInputDTO,
  TableWhiteboardNodeInputDTO,
  UserQueryWhiteboardNodeInputDTO,
} from '@detective.solutions/backend/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';
import { validateDto } from '@detective.solutions/backend/shared/utils';

export class WhiteboardNodeAddedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeAddedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<AnyWhiteboardNode>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException('Transaction cannot be executed due to missing message body information');
    }
    const addedWhiteboardNode = this.messageBody as AnyWhiteboardNode;
    const casefileId = this.messageContext.casefileId;

    switch (addedWhiteboardNode.type) {
      case WhiteboardNodeType.TABLE: {
        await validateDto(TableWhiteboardNodeInputDTO, addedWhiteboardNode, this.logger);
        this.forwardMessageToOtherClients();
        const response = await this.databaseService.addTableOccurrenceToCasefile(
          casefileId,
          addedWhiteboardNode as ITableWhiteboardNode
        );
        if (!response) {
          this.handleError(casefileId, addedWhiteboardNode.type);
        }
        break;
      }
      case WhiteboardNodeType.USER_QUERY: {
        await validateDto(UserQueryWhiteboardNodeInputDTO, addedWhiteboardNode, this.logger);
        this.forwardMessageToOtherClients();
        const response = await this.databaseService.addUserQueryOccurrenceToCasefile(
          casefileId,
          addedWhiteboardNode as IUserQueryWhiteboardNode
        );
        if (!response) {
          this.handleError(casefileId, addedWhiteboardNode.type);
        }
        break;
      }
      case WhiteboardNodeType.EMBEDDING: {
        await validateDto(EmbeddingWhiteboardNodeInputDTO, addedWhiteboardNode, this.logger);
        this.forwardMessageToOtherClients();
        const response = await this.databaseService.addEmbeddingToCasefile(
          casefileId,
          addedWhiteboardNode as IEmbeddingWhiteboardNode
        );
        if (!response) {
          this.handleError(casefileId, addedWhiteboardNode.type);
        }
        break;
      }
      default: {
        throw new InternalServerErrorException(
          `Could not execute transaction for unknown type ${addedWhiteboardNode.type}`
        );
      }
    }

    this.logger.log(`${this.logContext} Transaction successful`);
    this.logger.verbose(`${addedWhiteboardNode.type} node was successfully added to casefile ${casefileId}`);
  }

  private handleError(casefileId: string, nodeType: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`Could not add ${nodeType} node to casefile ${casefileId}`);
  }
}
