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
import { buildLogContext, validateDto } from '@detective.solutions/backend/shared/utils';

import { TransactionServiceRefs } from './factory';
import { WhiteboardTransaction } from './abstract';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class WhiteboardNodeAddedTransaction extends WhiteboardTransaction {
  readonly logger = new Logger(WhiteboardNodeAddedTransaction.name);

  constructor(serviceRefs: TransactionServiceRefs, messagePayload: IMessage<AnyWhiteboardNode>) {
    super(serviceRefs, messagePayload);
  }

  async execute(): Promise<void> {
    this.transactionProducer.sendKafkaMessage(KafkaTopic.TransactionOutputBroadcast, this.messagePayload);
    this.logger.log(
      `${buildLogContext(this.messagePayload.context)} Forwarded node information to topic ${
        KafkaTopic.TransactionOutputUnicast
      }`
    );

    const addedWhiteboardNode = this.messagePayload.body as AnyWhiteboardNode;
    const casefileId = this.messagePayload.context.casefileId;
    let response: Record<string, any>;

    switch (addedWhiteboardNode.type) {
      case WhiteboardNodeType.TABLE: {
        validateDto(TableWhiteboardNodeInputDTO, addedWhiteboardNode, this.logger);
        response = await this.databaseService.addTableOccurrenceToCasefile(
          casefileId,
          addedWhiteboardNode as ITableWhiteboardNode
        );
        break;
      }
      case WhiteboardNodeType.USER_QUERY: {
        validateDto(UserQueryWhiteboardNodeInputDTO, addedWhiteboardNode, this.logger);
        response = await this.databaseService.addUserQueryToCasefile(
          casefileId,
          addedWhiteboardNode as IUserQueryWhiteboardNode
        );
        break;
      }
      case WhiteboardNodeType.EMBEDDING: {
        validateDto(EmbeddingWhiteboardNodeInputDTO, addedWhiteboardNode, this.logger);
        response = await this.databaseService.addEmbeddingToCasefile(
          casefileId,
          addedWhiteboardNode as IEmbeddingWhiteboardNode
        );
        break;
      }
      default: {
        throw new InternalServerErrorException();
      }
    }
    if (!response) {
      // TODO: Improve error handling with caching of transaction data & re-running mutations
      throw new InternalServerErrorException(
        `Could not add ${addedWhiteboardNode.type} node to casefile ${casefileId}`
      );
    }
    this.logger.log(
      `${buildLogContext(this.messagePayload.context)} Added ${addedWhiteboardNode.type} node to casefile ${casefileId}`
    );
  }
}
