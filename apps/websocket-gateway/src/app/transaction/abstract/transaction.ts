import { CacheService, DatabaseService } from '../../services';
import { IMessage, IMessageContext, KafkaTopic } from '@detective.solutions/shared/data-access';

import { KafkaEventProducer } from '../../kafka';
import { Logger } from '@nestjs/common';
import { TransactionServiceRefs } from '../../models';
import { WhiteboardWebSocketGateway } from '../../websocket';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Transaction {
  abstract readonly logger: Logger;

  readonly cacheService: CacheService;
  readonly databaseService: DatabaseService;
  readonly kafkaEventProducer: KafkaEventProducer;
  readonly whiteboardWebSocketGateway: WhiteboardWebSocketGateway;

  message: IMessage<any>;
  messageContext: IMessageContext;
  tenantId: string;
  casefileId: string;
  userId: string;
  nodeId: string | undefined;
  timestamp: number;
  messageBody: any;
  logContext: string;

  protected readonly missingMessageBodyErrorText =
    'Transaction cannot be executed due to missing message body information';

  constructor(serviceRefs: TransactionServiceRefs, message: IMessage<any>) {
    this.cacheService = serviceRefs.cacheService;
    this.databaseService = serviceRefs.databaseService;
    this.whiteboardWebSocketGateway = serviceRefs.whiteboardWebSocketGateway;
    this.kafkaEventProducer = serviceRefs.kafkaEventProducer;
    this.message = message;
    this.messageContext = message.context;
    this.tenantId = this.messageContext.tenantId;
    this.casefileId = this.messageContext.casefileId;
    this.userId = this.messageContext.userId;
    this.nodeId = this.messageContext?.nodeId;
    this.timestamp = this.messageContext.timestamp;
    this.messageBody = message.body;
    this.logContext = buildLogContext(this.messageContext);
  }

  abstract execute(): Promise<void>;

  protected broadcastMessage() {
    this.whiteboardWebSocketGateway.sendPropagatedBroadcastMessage(this.message);
    this.logger.verbose(`${this.logContext} Broadcasted transaction information`);
  }

  protected unicastMessage() {
    this.whiteboardWebSocketGateway.sendPropagatedUnicastMessage(this.message);
    this.logger.verbose(`${this.logContext} Broadcasted transaction information`);
  }

  protected sendKafkaMessage(targetTopic: KafkaTopic) {
    this.kafkaEventProducer.produceKafkaEvent(targetTopic, this.message);
    this.logger.verbose(`${this.logContext} Broadcasted transaction information`);
  }
}
